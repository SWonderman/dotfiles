-- highlight yanked block of text
vim.api.nvim_create_autocmd('TextYankPost', {
  desc = 'Highlight yanked block of text',
  group = vim.api.nvim_create_augroup('sw-highlight-yank', { clear = true }),
  callback = function()
    vim.hl.on_yank()
  end,
})
