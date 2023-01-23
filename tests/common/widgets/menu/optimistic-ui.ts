import { wait } from '@instantsearch/testutils';
import {
  createSearchClient,
  createMultiSearchResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import type { MenuSetup } from '.';
import type { Act } from '../../common';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/dom';

export function createOptimisticUiTests(setup: MenuSetup, act: Act) {
  describe('optimistic UI', () => {
    test('checks the clicked refinement immediately regardless of network latency', async () => {
      const delay = 100;
      const margin = 10;
      const attribute = 'brand';
      const options = {
        instantSearchOptions: {
          indexName: 'indexName',
          searchClient: createSearchClient({
            search: jest.fn(async (requests) => {
              await wait(delay);
              return createMultiSearchResponse(
                ...requests.map(() =>
                  createSingleSearchResponse({
                    facets: {
                      [attribute]: {
                        Samsung: 100,
                        Apple: 200,
                      },
                    },
                  })
                )
              );
            }),
          }),
        },
        widgetParams: { attribute },
      };

      await setup(options);

      // Wait for initial results to populate widgets with data
      await act(async () => {
        await wait(margin + delay);
        await wait(0);
      });

      // Initial state, before interaction
      {
        expect(document.querySelectorAll('.ais-Menu-item')).toHaveLength(2);
        expect(
          document.querySelectorAll('.ais-Menu-item--selected')
        ).toHaveLength(0);
      }

      // Select a refinement
      {
        const firstItem = screen.getByRole('link', {
          name: 'Apple 200',
        });

        await act(async () => {
          userEvent.click(firstItem);
          await wait(0);
          await wait(0);
        });

        // UI has changed immediately after the user interaction
        // @TODO: menu doesn't have any accessible way to determine if an item is selected, so we use the class name (https://github.com/algolia/instantsearch/issues/5187)
        expect(
          document.querySelectorAll('.ais-Menu-item--selected')
        ).toHaveLength(1);
      }

      // Wait for new results to come in
      {
        await act(async () => {
          await wait(delay + margin);
        });

        expect(
          document.querySelectorAll('.ais-Menu-item--selected')
        ).toHaveLength(1);
      }

      // Unselect the refinement
      {
        const firstItem = screen.getByRole('link', {
          name: 'Apple 200',
        });

        await act(async () => {
          userEvent.click(firstItem);
          await wait(0);
          await wait(0);
        });

        // UI has changed immediately after the user interaction
        expect(
          document.querySelectorAll('.ais-Menu-item--selected')
        ).toHaveLength(0);
      }

      // Wait for new results to come in
      {
        await act(async () => {
          await wait(delay + margin);
          await wait(0);
        });

        expect(
          document.querySelectorAll('.ais-Menu-item--selected')
        ).toHaveLength(0);
      }
    });
  });
}
