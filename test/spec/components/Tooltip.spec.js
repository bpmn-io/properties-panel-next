import {
  render,
  cleanup
} from '@testing-library/preact/pure';

import { fireEvent, waitFor } from '@testing-library/preact';

import TestContainer from 'mocha-test-container-support';

import {
  query as domQuery
} from 'min-dom';

import {
  expectNoViolations,
  insertCoreStyles
} from 'test/TestHelper';

import Tooltip from 'src/components/entries/Tooltip';
import { act } from 'preact/test-utils';


insertCoreStyles();


describe('<Tooltip>', function() {

  let container, parent, clock;

  beforeEach(function() {
    parent = TestContainer.get(this);
    parent.style.marginLeft = 'auto';
    parent.style.width = '50vw';

    container = document.createElement('div');
    container.classList.add('bio-properties-panel');

    parent.appendChild(container);
    clock = sinon.useFakeTimers();
  });

  afterEach(function() {
    cleanup();
    clock.restore();
  });

  function openTooltip(element) {
    return act(() => {
      fireEvent.mouseEnter(element);
      clock.tick(200);
    });
  }


  describe('render', function() {

    it('should not render by default', function() {

      // given
      const result = createTooltip({ container });

      // then
      expect(domQuery('.bio-properties-panel-tooltip-wrapper', result.container)).to.exist;
      expect(domQuery('.bio-properties-panel-tooltip', result.container)).to.not.exist;
    });


    it('should render if trigger element is hovered', async function() {

      // given
      createTooltip({ container });
      const element = domQuery('.bio-properties-panel-tooltip-wrapper', container);

      // when
      await openTooltip(element);

      // then
      expect(domQuery('.bio-properties-panel-tooltip')).to.exist;
    });


    it('should not render if trigger element no longer hovered', async function() {

      // given
      createTooltip({ container });
      const wrapper = domQuery('.bio-properties-panel-tooltip-wrapper', container);

      // when
      await openTooltip(wrapper);

      // then
      expect(domQuery('.bio-properties-panel-tooltip')).to.exist;

      // when
      fireEvent.mouseMove(container, {
        clientX: 16,
        clientY: 16,
      });

      // expect
      expect(domQuery('.bio-properties-panel-tooltip')).to.not.exist;
    });

  });


  describe('position', function() {

    it('should render beside trigger element', async function() {

      // given
      createTooltip({ container });
      const element = domQuery('#componentId', container);
      const wrapper = domQuery('.bio-properties-panel-tooltip-wrapper', container);

      // when
      await openTooltip(wrapper);

      // then
      const elementRect = element.getBoundingClientRect();
      const tooltipRect = domQuery('.bio-properties-panel-tooltip').getBoundingClientRect();

      expect(tooltipRect.top).to.equal(elementRect.top - 10);
      expect(tooltipRect.right).to.equal(elementRect.x);
    });

  });


  describe('content', function() {

    it('should render tooltip content', async function() {

      // given
      const tooltipContent = <div>
        <div>tooltip text</div>
        <a href="#">some link</a>
      </div>;

      createTooltip({ container, value: tooltipContent });
      const wrapper = domQuery('.bio-properties-panel-tooltip-wrapper', container);

      // when
      await openTooltip(wrapper);

      // then
      const tooltipContentNode = domQuery('.bio-properties-panel-tooltip-content');
      expect(tooltipContentNode).to.exist;
      expect(tooltipContentNode.innerHTML).to.equal(
        '<div><div>tooltip text</div><a href="#">some link</a></div>'
      );
    });

  });


  describe('a11y', function() {

    it('should have no violations', async function() {

      // given
      const { container: node } = createTooltip({ container });

      // then
      return waitFor(() => {
        expectNoViolations(node);
      }, 5000);
    });


    it('should have no violations - tooltip shown', async function() {

      // given
      createTooltip({ container });

      // when
      const wrapper = domQuery('.bio-properties-panel-tooltip-wrapper', container);
      await openTooltip(wrapper);

      // then
      return waitFor(() => {
        expectNoViolations(domQuery('.bio-properties-panel-tooltip', container));
      }, 5000);
    });

  });

});


// helpers ////////////////////

function createTooltip(options = {}, renderFn = render) {
  const {
    container,
    value = 'tooltip text'
  } = options;

  return renderFn(
    <Tooltip labelId="componentId" value={ value }>
      <div id="componentId">foo</div>
    </Tooltip>, { container });
}
