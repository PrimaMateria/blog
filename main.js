function setExtraWidth() {
  document.querySelectorAll('pre, .table-wrapper').forEach((element) => {
    const elementLeft = element.getBoundingClientRect().x;
    const clientWidth = document.documentElement.clientWidth;
    const margin = 4;
    const extraWidth = clientWidth - elementLeft - margin;
    element.style.width = `${extraWidth}px`;
  });
}

function wrapTables() {
  document.querySelectorAll('article table').forEach((element) => {
    const wrapper = document.createElement('div');
    wrapper.className = "table-wrapper";
    element.parentNode.insertBefore(wrapper, element);
    wrapper.appendChild(element);
  });
}

window.addEventListener("load", () => {
  wrapTables();
  setExtraWidth();
});

window.addEventListener('resize', () => {
  setExtraWidth();
});
