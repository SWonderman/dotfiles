// tmux-style prefix key. keys.json binds ctrl-space to `mod.open:tmux-leader`;
// this popup grabs the keyboard, waits for ONE key, runs what TABLE says and
// closes, like tmux's prefix table. Entries with `repeat` keep it open (tmux
// `bind -r`), so `ctrl-space n n n` walks tabs. Esc, ctrl-space or any
// unbound key closes it. The table doubles as the on-screen cheat sheet.
//
// tmux → Herdr: session = space, window = tab, pane = pane.

import { View, div } from "gpui-kit";
import { v_flex, h_flex } from "gpui-base";
import { run, openOverlay, props, closeOverlay, theme } from "herdr";

const switcher = (mode) => () =>
  openOverlay({ mod: "tmux-switch", kind: "dialog", width: 560, height: 440, props: { mode } });

// [key, label, action, repeat?]. `key` is the typed character (so "|" works
// whatever the keyboard), or a named key such as "escape".
const TABLE = [
  ["s", "sessions", switcher("spaces")],
  ["w", "windows", switcher("tabs")],
  ["c", "new window", () => run("tab.new")],
  ["C", "new session", () => run("space.new")],
  [",", "rename window", () => run("tab.rename")],
  ["$", "rename session", () => run("space.rename")],
  ["n", "next window", () => run("tab.next"), true],
  ["p", "prev window", () => run("tab.prev"), true],
  [")", "next session", () => run("space.next"), true],
  ["(", "prev session", () => run("space.prev"), true],
  ["|", "split right", () => run("pane.split", { direction: "right" })],
  ["-", "split down", () => run("pane.split", { direction: "down" })],
  ["z", "zoom pane", () => run("pane.zoom")],
  ["x", "kill pane", () => run("pane.close")],
  ["b", "toggle sidebar", () => run("layout.toggle", { id: "sidebar" })],
  ["1-9", "window N", null],
];
for (let i = 1; i <= 9; i++) TABLE.push([String(i), null, () => run("tab.select", { index: i })]);

export default class Leader extends View {
  init(_props, cx) {
    this.handle = cx.focus_handle();
    this.handle.focus();
    // The popup may mount a frame after init; take the keyboard again then.
    cx.timer.after(16, () => this.handle.focus());
  }

  close() {
    closeOverlay(props().overlay);
  }

  onKey(e, cx) {
    const ch = e.modifiers.control || e.modifiers.alt || e.modifiers.platform ? null : e.key_char;
    const hit = TABLE.find(([k, , act]) => act && (k === ch || k === e.keystroke));
    cx.stop_propagation();
    if (!hit) return this.close(); // escape, ctrl-space, anything unbound
    const [, , act, repeat] = hit;
    if (repeat) {
      act();
      this.handle.focus();
    } else {
      this.close();
      act();
    }
  }

  render() {
    const t = theme();
    const shown = TABLE.filter(([, label]) => label);
    const half = Math.ceil(shown.length / 2);
    const col = (rows) =>
      v_flex().flex_1().gap(3).children(
        rows.map(([k, label, , repeat]) =>
          h_flex().gap(10).items_center().h(20)
            .child(h_flex().w(34).flex_none().justify_center().rounded(4).bg(t.raised).text_color(t.accent).font_semibold().child(k))
            .child(div().flex_1().truncate().text_color(t.foreground).child(label))
            .when(repeat, (el) => el.child(div().text_size(10).text_color(t.dim).child("↻"))),
        ),
      );
    return v_flex()
      .id("tmux-leader")
      .track_focus(this.handle)
      .on_key_down((e, cx) => this.onKey(e, cx))
      .size_full()
      .min_h(0)
      .p(16)
      .gap(12)
      .bg(t.popover)
      .text_size(12)
      .child(
        h_flex().items_center()
          .child(div().flex_1().text_size(13).font_semibold().text_color(t.foreground).child("prefix"))
          .child(div().text_size(11).text_color(t.dim).child("↻ repeats · Esc closes")),
      )
      .child(h_flex().gap(16).child(col(shown.slice(0, half))).child(col(shown.slice(half))));
  }
}
