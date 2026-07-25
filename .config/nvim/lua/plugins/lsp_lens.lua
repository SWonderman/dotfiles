return {
  'VidocqH/lsp-lens.nvim',
  event = { 'BufReadPost', 'BufNewFile' },
  dependencies = { 'neovim/nvim-lspconfig' },
  keys = {
    { '<leader>tl', '<cmd>LspLensToggle<cr>', desc = '[T]oggle Lsp [L]ens' },
  },
  config = function()
    require('lsp-lens').setup {
      enable = true,
      include_declaration = false,
      sections = {
        definition = false,
        references = true,
        implements = true,
        git_authors = false,
      },
    }
  end,
}
