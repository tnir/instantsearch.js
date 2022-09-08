/**
 * @jest-environment jsdom
 */
/** @jsx h */
import { h } from 'preact';

import { createSearchClient } from '../../../../test/mock/createSearchClient';
import instantsearch from '../../../index.es';
import { wait } from '../../../../test/utils/wait';
import relevantSort from '../relevant-sort';
import {
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '../../../../test/mock/createAPIResponse';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('relevantSort', () => {
  describe('templates', () => {
    test('renders default templates', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.addWidgets([relevantSort({ container })]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="ais-RelevantSort"
  >
    <div
      class="ais-RelevantSort-text"
    />
    <button
      class="ais-RelevantSort-button"
      type="button"
    >
      <span>
        See all results
      </span>
    </button>
  </div>
</div>
`);
    });

    test('renders with templates using `html`', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.addWidgets([
        relevantSort({
          container,
          templates: {
            text({ isRelevantSorted }, { html }) {
              return html`<p>
                Click the button to
                ${isRelevantSorted
                  ? 'see all results.'
                  : 'see relevant results.'}
              </p>`;
            },
            button({ isRelevantSorted }, { html }) {
              return html`<span
                >${isRelevantSorted
                  ? 'See all results'
                  : 'See relevant results'}</span
              >`;
            },
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="ais-RelevantSort"
  >
    <div
      class="ais-RelevantSort-text"
    >
      <p>
        Click the button to
        see all results.
      </p>
    </div>
    <button
      class="ais-RelevantSort-button"
      type="button"
    >
      <span>
        <span>
          See all results
        </span>
      </span>
    </button>
  </div>
</div>
`);
    });

    test('renders with templates using JSX', async () => {
      const container = document.createElement('div');
      const searchClient = createMockedSearchClient();

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.addWidgets([
        relevantSort({
          container,
          templates: {
            text({ isRelevantSorted }) {
              return (
                <p>
                  Click the button to{' '}
                  {isRelevantSorted
                    ? 'see all results.'
                    : 'see relevant results.'}
                </p>
              );
            },
            button({ isRelevantSorted }) {
              return (
                <span>
                  {isRelevantSorted
                    ? 'See all results'
                    : 'See relevant results'}
                </span>
              );
            },
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="ais-RelevantSort"
  >
    <div
      class="ais-RelevantSort-text"
    >
      <p>
        Click the button to
         
        see all results.
      </p>
    </div>
    <button
      class="ais-RelevantSort-button"
      type="button"
    >
      <span>
        <span>
          See all results
        </span>
      </span>
    </button>
  </div>
</div>
`);
    });

    function createMockedSearchClient() {
      return createSearchClient({
        search: jest.fn((requests) => {
          return Promise.resolve(
            createMultiSearchResponse(
              ...requests.map(() =>
                createSingleSearchResponse({
                  appliedRelevancyStrictness: 70,
                })
              )
            )
          );
        }),
      });
    }
  });
});
