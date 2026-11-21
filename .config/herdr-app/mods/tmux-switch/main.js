// tmux choose-tree, Herdr-style. Opened by tmux-leader as a dialog with
// props { mode: "spaces" } (prefix s, sessions) or { mode: "tabs" } (prefix w,
// windows of the current session).
//
// Type to filter. ↑/↓, ctrl-n/ctrl-p or ctrl-j/ctrl-k move, Enter goes.
// Same keys as the fzf sessions popup in the tmux config:
//   ctrl-x close · ctrl-r rename · ctrl-a new
// shift-↑/↓ moves the selected item up/down (tmux swap-window).

import { View, div, svg } from "gpui-kit";
import { v_flex, h_flex, InputState, Input } from "gpui-base";
import { spaces, agents, run, props, closeOverlay, theme } from "herdr";

const ROW = 30;
const MAX_ROWS = 10;

export default class Switch extends View {
  init(_props, cx) {
    this.mode = props()?.mode === "tabs" ? "tabs" : "spaces";
    this.filter = "";
    this.selId = null; // selection follows the item, not the row number
    this.top = 0; // first visible row
    this.handle = cx.focus_handle();
    this.input = InputState.new({ placeholder: this.mode === "tabs" ? "Filter windows…" : "Filter sessions…" });
    this.input.on("change", (_e, cx) => {
      this.filter = this.input.value();
      this.selId = this.items()[0]?.id ?? null;
      cx.notify();
    });
    this.input.on("submit", () => this.go(this.selected()));
    this.input.focus();
    cx.timer.after(16, () => this.input.focus());
  }

  close() {
    closeOverlay(props().overlay);
  }

  // Rows for the current mode: { id, name, detail, status, active, index }.
  items() {
    const f = this.filter.toLowerCase();
    const all = agents();
    const who = (pred) => [...new Set(all.filter(pred).map((a) => a.program?.name ?? "agent"))].join(" · ");
    let rows;
    if (this.mode === "spaces") {
      rows = spaces().map((s, i) => ({
        id: s.id,
        index: i + 1,
        name: s.name,
        detail: [s.machine, s.branch, `${s.tabs.length} win`, who((a) => a.space === s.id)].filter(Boolean).join("  ·  "),
        status: s.status,
        active: s.active,
      }));
    } else {
      const space = spaces().find((s) => s.active);
      rows = (space?.tabs ?? []).map((tb) => ({
        id: tb.id,
        index: tb.index,
        name: tb.named ? `${tb.index}: ${tb.name}` : tb.name,
        detail: [`${tb.panes} pane${tb.panes === 1 ? "" : "s"}`, tb.zoomed && "zoomed", who((a) => a.tab === tb.id)].filter(Boolean).join("  ·  "),
        status: tb.status,
        active: tb.active,
      }));
    }
    return f ? rows.filter((r) => `${r.name} ${r.detail}`.toLowerCase().includes(f)) : rows;
  }

  selected(rows = this.items()) {
    return rows.find((r) => r.id === this.selId) ?? rows.find((r) => r.active) ?? rows[0];
  }

  go(r) {
    if (!r) return;
    this.close();
    run(this.mode === "spaces" ? "space.select" : "tab.select", { id: r.id });
  }

  // Close the dialog first so Herdr's own prompts (rename, confirm) aren't under it.
  act(r, what) {
    const sp = this.mode === "spaces";
    if (what === "new") {
      this.close();
      return run(sp ? "space.new" : "tab.new");
    }
    if (!r) return;
    this.close();
    if (what === "close") run(sp ? "space.close" : "tab.close", { id: r.id });
    if (what === "rename") run(sp ? "space.rename" : "tab.rename", { id: r.id });
  }

  move(r, by) {
    if (!r || this.filter) return; // positions only mean something unfiltered
    if (this.mode === "tabs") run("tab.move", { id: r.id, by });
    else {
      const to = r.index + by;
      if (to >= 1 && to <= spaces().length) run("space.move", { id: r.id, index: to });
    }
    this.selId = r.id;
  }

  onKey(e, cx) {
    const rows = this.items();
    const at = Math.max(0, rows.indexOf(this.selected(rows)));
    const step = (d) => { if (rows.length) this.selId = rows[(at + d + rows.length) % rows.length].id; };
    switch (e.keystroke) {
      case "escape": return this.close();
      case "down": case "ctrl-n": case "ctrl-j": step(1); break;
      case "up": case "ctrl-p": case "ctrl-k": step(-1); break;
      case "shift-down": this.move(rows[at], 1); break;
      case "shift-up": this.move(rows[at], -1); break;
      case "ctrl-x": this.act(rows[at], "close"); break;
      case "ctrl-r": this.act(rows[at], "rename"); break;
      case "ctrl-a": this.act(rows[at], "new"); break;
      default: return; // everything else types into the filter
    }
    cx.stop_propagation();
    cx.notify();
  }

  glyph(t, st) {
    if (st === "working") return svg("mods/workspace-chrome/spinner.svg").size(12).flex_none().text_color(t.working).spin(900);
    return div().w(12).flex_none().text_color(t[st] ?? t.dim).child(st === "idle" ? "○" : st ? "●" : "·");
  }

  render() {
    const t = theme();
    const rows = this.items();
    const sel = this.selected(rows);
    const at = Math.max(0, rows.indexOf(sel));
    // Keep the selection in a window of MAX_ROWS rows.
    if (at < this.top) this.top = at;
    if (at >= this.top + MAX_ROWS) this.top = at - MAX_ROWS + 1;
    this.top = Math.max(0, Math.min(this.top, rows.length - MAX_ROWS));
    const visible = rows.slice(this.top, this.top + MAX_ROWS);

    const row = (r) =>
      h_flex()
        .id(`sw-${r.id}`)
        .h(ROW)
        .flex_none()
        .px(10)
        .gap(10)
        .rounded(7)
        .items_center()
        .cursor_pointer()
        .when(r === sel, (el) => el.bg(t.hover))
        .hover((s) => s.bg(t.hover))
        .on_click(() => this.go(r))
        .child(this.glyph(t, r.status))
        .child(div().flex_1().truncate().text_color(t.foreground).when(r.active, (d) => d.font_semibold()).child(r.name))
        .when(r.status === "blocked", (el) => el.child(div().text_size(11).text_color(t.blocked).child("needs you")))
        .child(div().text_size(11).text_color(t.dim).child(r.detail));

    const hint = (k, label) => h_flex().gap(4).child(div().text_color(t.accent).child(k)).child(label);

    return v_flex()
      .id("tmux-switch")
      .track_focus(this.handle)
      .on_key_down((e, cx) => this.onKey(e, cx))
      .size_full()
      .min_h(0)
      .p(18)
      .gap(10)
      .bg(t.popover)
      .text_size(13)
      .child(
        h_flex().items_center()
          .child(div().flex_1().text_size(15).font_semibold().text_color(t.foreground).child(this.mode === "tabs" ? "Windows" : "Sessions"))
          .child(div().text_size(11).text_color(t.dim).child("Esc")),
      )
      .child(
        h_flex().h(36).flex_none().px(10).gap(8).items_center().rounded(9).border_1().border_color(t.accent).bg(t.background)
          .child(svg("mods/workspace-chrome/search.svg").size(15).text_color(t.dim))
          .child(Input.new(this.input).flex_1().h_full().text_size(12.8).text_color(t.foreground)),
      )
      .child(
        v_flex().flex_1().min_h(0).gap(2)
          .when(rows.length === 0, (el) => el.child(div().p(10).text_color(t.dim).child("Nothing matches")))
          .when(this.top > 0, (el) => el.child(div().text_size(10).text_color(t.dim).child(`  ↑ ${this.top} more`)))
          .children(visible.map(row))
          .when(rows.length > this.top + MAX_ROWS, (el) => el.child(div().text_size(10).text_color(t.dim).child(`  ↓ ${rows.length - this.top - MAX_ROWS} more`))),
      )
      .child(
        h_flex().gap(14).text_size(11).text_color(t.dim)
          .child(hint("⏎", "go"))
          .child(hint("^x", "close"))
          .child(hint("^r", "rename"))
          .child(hint("^a", "new"))
          .child(hint("⇧↑↓", "move")),
      );
  }
}
