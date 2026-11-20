return {
  'nvim-neo-tree/neo-tree.nvim',
  branch = 'v3.x',
  dependencies = {
    'nvim-lua/plenary.nvim',
    'MunifTanjim/nui.nvim',
    'nvim-tree/nvim-web-devicons',
  },
  cmd = 'Neotree',
  keys = {
    { '\\', '<cmd>Neotree toggle filesystem reveal left<cr>', desc = 'Toggle file tree' },
    { '<leader>gs', '<cmd>Neotree toggle git_status left<cr>', desc = '[G]it [S]tatus tree (changed files)' },
  },
  opts = {
    sources = { 'filesystem', 'git_status', 'buffers' },
    -- Tab bar at the top of the panel; switch with < and >
    source_selector = {
      winbar = true,
      sources = {
        { source = 'filesystem', display_name = ' 󰉓 Files ' },
        { source = 'git_status', display_name = ' 󰊢 Changes ' },
        { source = 'buffers', display_name = ' 󰈚 Buffers ' },
      },
    },
    filesystem = {
      follow_current_file = { enabled = true },
      use_libuv_file_watcher = true,
      window = {
        mappings = {
          ['\\'] = 'close_window',
        },
      },
    },
  },
}
