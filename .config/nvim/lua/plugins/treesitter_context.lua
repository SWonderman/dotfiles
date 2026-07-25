return {
  'nvim-treesitter/nvim-treesitter-context',
  event = { 'BufReadPost', 'BufNewFile' },
  dependencies = { 'nvim-treesitter/nvim-treesitter' },
  keys = {
    { '<leader>tc', '<cmd>TSContext toggle<cr>', desc = '[T]oggle Treesitter [C]ontext' },
    {
      '[c',
      function()
        require('treesitter-context').go_to_context(vim.v.count1)
      end,
      desc = 'Jump to [c]ontext (upwards)',
    },
  },
  config = function()
    require('treesitter-context').setup {
      max_lines = 3,
      multiline_threshold = 1,
      trim_scope = 'outer',
      mode = 'cursor',
    }
  end,
}
