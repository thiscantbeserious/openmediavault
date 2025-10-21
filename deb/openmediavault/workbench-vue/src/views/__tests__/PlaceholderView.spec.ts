import { mount } from '@vue/test-utils';
import PlaceholderView from '../PlaceholderView.vue';

describe('PlaceholderView', () => {
  it('matches the current placeholder layout snapshot', () => {
    const wrapper = mount(PlaceholderView);
    expect(wrapper.html()).toMatchSnapshot();
  });
});
