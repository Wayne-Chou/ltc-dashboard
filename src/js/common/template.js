// template.js
export function getTemplate(id) {
    const tpl = document.getElementById(id);
    return tpl ? tpl.innerHTML : "";
  }