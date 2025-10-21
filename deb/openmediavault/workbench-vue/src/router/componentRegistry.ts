import { Component } from 'vue';

const registry = new Map<string, Component>();

export const registerComponent = (name: string, component: Component) => {
  registry.set(name, component);
};

export const getComponentByType = (name: string): Component | undefined => {
  return registry.get(name);
};

registerComponent('blankPage', {
  template: '<div data-testid="blank-page">Blank Page</div>'
});
