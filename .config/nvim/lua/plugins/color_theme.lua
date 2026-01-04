return {
  'datsfilipe/vesper.nvim',
  priority = 1000,
  config = function()
    require('vesper').setup {
      transparent = true,
      italics = {
        comments = false,
        keywords = false,
        functions = false,
        strings = false,
        variables = false,
      },
    }
    vim.cmd.colorscheme 'vesper'
  end,
  opts = {},
}
