export const h = (tag, props = {}, ...children) => {
    const element = document.createElement(tag);
    Object.entries(props ?? {}).forEach(([key, value]) => {
        if (value === undefined || value === null || value === false) {
            return;
        }
        if (key.startsWith('on')) {
            element.addEventListener(key.slice(2).toLowerCase(), value);
        } else if (key === 'className') {
            element.className = value;
        } else if (key === 'style') {
            element.setAttribute('style', value);
        } else {
            element.setAttribute(key, value === true ? '' : value);
        }
    });
    element.append(...children.flat().filter((child) => child !== null && child !== undefined && child !== false));
    return element;
};
