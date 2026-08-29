-- highlight yanked block of text
vim.api.nvim_create_autocmd('TextYankPost', {
  desc = 'Highlight yanked block of text',
  group = vim.api.nvim_create_augroup('sw-highlight-yank', { clear = true }),
  callback = function()
    vim.hl.on_yank()
  end,
})

-- indent guides for space-indented files
local indent_guides = vim.api.nvim_create_augroup('sw-indent-guides', { clear = true })

local function set_indent_guides()
  local width = vim.fn.shiftwidth()
  if width < 1 then
    width = 1
  end
  local listchars = vim.opt.listchars:get()
  listchars.leadmultispace = '│' .. string.rep(' ', width - 1)
  vim.opt_local.listchars = listchars
end

vim.api.nvim_create_autocmd({ 'BufWinEnter', 'FileType' }, {
  desc = 'Draw indent guides for leading spaces',
  group = indent_guides,
  callback = set_indent_guides,
})

vim.api.nvim_create_autocmd('OptionSet', {
  desc = 'Resize indent guides when the indent width changes',
  group = indent_guides,
  pattern = { 'shiftwidth', 'tabstop', 'expandtab' },
  callback = set_indent_guides,
})
