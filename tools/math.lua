-- تبدیل <span class="m">\(..\)</span> و <div class="m display">\[..\]</div> به معادلهٔ واقعی
local function strip(t, a, b)
  t = t:gsub('^%s*\\' .. a, ''):gsub('\\' .. b .. '%s*$', '')
  return t
end
function Span(el)
  if el.classes:includes('m') then
    return pandoc.Math('InlineMath', strip(pandoc.utils.stringify(el), '%(', '%)'))
  end
end
function Div(el)
  if el.classes:includes('m') then
    return pandoc.Para{pandoc.Math('DisplayMath', strip(pandoc.utils.stringify(el), '%[', '%]'))}
  end
end
