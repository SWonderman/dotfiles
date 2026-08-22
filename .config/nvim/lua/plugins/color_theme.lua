local default_theme = 'nightfox'

return {
  {
    'datsfilipe/vesper.nvim',
    priority = 1000,
    config = function()
      require('vesper').setup {
        transparent = false,
        italics = {
          comments = false,
          keywords = false,
          functions = false,
          strings = false,
          variables = false,
        },
      }
    end,
    init = function()
      if default_theme == 'vesper' then
        vim.cmd.colorscheme 'vesper'
      end
    end,
    opts = {},
  },
  {
    'AlexvZyl/nordic.nvim',
    priority = 1000,
    config = function()
      require('nordic').setup {}
    end,
    init = function()
      if default_theme == 'nordic' then
        vim.cmd.colorscheme 'nordic'
      end
    end,
  },
  {
    'rebelot/kanagawa.nvim',
    priority = 1000,
    config = function()
      require('kanagawa').setup {}
    end,
    init = function()
      if default_theme == 'kanagawa' then
        vim.cmd.colorscheme 'kanagawa-dragon'
      end
    end,
  },
  {
    'EdenEast/nightfox.nvim',
    priority = 1000,
    config = function()
      require('nightfox').setup {
        options = {
          dim_inactive = true,
        },
      }
    end,
    init = function()
      if default_theme == 'nightfox' then
        vim.cmd.colorscheme 'nightfox'
      end
    end,
  },
  {
    'projekt0n/github-nvim-theme',
    name = 'github-theme',
    lazy = false,
    priority = 1000,
    config = function()
      require('github-theme').setup {
        options = {
          dim_inactive = true,
        },
      }
      if default_theme == 'github' then
        vim.cmd.colorscheme 'github_dark'
      end
    end,
  },
}
