/**
 * @jest-environment node
 */
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  InstantSearch,
  InstantSearchServerContext,
} from 'react-instantsearch-hooks';

import * as allWidgets from '../';
import { createSearchClient } from '../../../../../test/mock';

import type { InstantSearch as InstantSearchClass } from 'instantsearch.js';

// We only track widgets that use connectors.
type RegularWidgets = Omit<typeof allWidgets, 'Highlight' | 'Snippet'>;

type SingleWidget = {
  [name in keyof RegularWidgets]: {
    name: name;
    Component: RegularWidgets[name];
  };
}[keyof RegularWidgets];

function Widget({ widget }: { widget: SingleWidget }) {
  switch (widget.name) {
    case 'SortBy': {
      return <widget.Component items={[]} />;
    }
    case 'HitsPerPage': {
      return (
        <widget.Component items={[{ label: '10', value: 10, default: true }]} />
      );
    }
    case 'RefinementList': {
      return <widget.Component attribute="brand" />;
    }
    default: {
      return <widget.Component />;
    }
  }
}

/**
 * Uses the SSR APIs to access the InstantSearch widgets rendered by all React InstantSearch
 * components/widgets.
 */
function initializeWidgets() {
  return Object.entries(allWidgets)
    .filter(
      (
        regularWidget
      ): regularWidget is [
        keyof RegularWidgets,
        RegularWidgets[keyof RegularWidgets]
      ] => ['Highlight', 'Snippet'].includes(regularWidget[0]) === false
    )
    .map(([name, Component]) => {
      let instantSearchInstance: InstantSearchClass | undefined = undefined;

      const widget = { name, Component } as SingleWidget;

      renderToString(
        <InstantSearchServerContext.Provider
          value={{
            notifyServer: ({ search }) => {
              instantSearchInstance = search;
            },
          }}
        >
          <InstantSearch
            searchClient={createSearchClient()}
            indexName="indexName"
          >
            <Widget widget={widget} />
          </InstantSearch>
        </InstantSearchServerContext.Provider>
      );

      const renderedWidgets = instantSearchInstance!.mainIndex.getWidgets();

      return {
        name,
        renderedWidgets,
        widget: renderedWidgets[0],
      };
    });
}

describe('widgets', () => {
  const widgets = initializeWidgets();

  test('renders one widget', () => {
    widgets.forEach(({ name, renderedWidgets }) => {
      expect({ name, renderedWidgets }).toEqual({
        name,
        renderedWidgets: expect.objectContaining({
          length: 1,
        }),
      });
    });
  });

  describe('$$type', () => {
    test('is present in every widget', () => {
      widgets.forEach(({ name, renderedWidgets }) => {
        renderedWidgets.forEach((widget) =>
          expect([name, widget.$$type]).toEqual([name, expect.any(String)])
        );
      });
    });

    test('starts with "ais."', () => {
      widgets.forEach(({ name, widget }) =>
        expect([name, widget.$$type.substr(0, 4)]).toEqual([name, 'ais.'])
      );
    });
  });

  describe('$$widgetType', () => {
    test('is present in every widget', () => {
      widgets.forEach(({ name, widget }) =>
        expect([name, widget.$$widgetType]).toEqual([name, expect.any(String)])
      );
    });

    test('starts with "ais."', () => {
      widgets.forEach(({ name, widget }) =>
        expect([name, widget.$$widgetType!.substr(0, 4)]).toEqual([
          name,
          'ais.',
        ])
      );
    });
  });

  test('name, $$type and $$widgetType are equivalent', () => {
    expect(
      widgets.map(({ name, widget: { $$type, $$widgetType } }) => ({
        name,
        $$type,
        $$widgetType,
      }))
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "$$type": "ais.clearRefinements",
          "$$widgetType": "ais.clearRefinements",
          "name": "ClearRefinements",
        },
        Object {
          "$$type": "ais.currentRefinements",
          "$$widgetType": "ais.currentRefinements",
          "name": "CurrentRefinements",
        },
        Object {
          "$$type": "ais.hits",
          "$$widgetType": "ais.hits",
          "name": "Hits",
        },
        Object {
          "$$type": "ais.hitsPerPage",
          "$$widgetType": "ais.hitsPerPage",
          "name": "HitsPerPage",
        },
        Object {
          "$$type": "ais.pagination",
          "$$widgetType": "ais.pagination",
          "name": "Pagination",
        },
        Object {
          "$$type": "ais.refinementList",
          "$$widgetType": "ais.refinementList",
          "name": "RefinementList",
        },
        Object {
          "$$type": "ais.searchBox",
          "$$widgetType": "ais.searchBox",
          "name": "SearchBox",
        },
        Object {
          "$$type": "ais.sortBy",
          "$$widgetType": "ais.sortBy",
          "name": "SortBy",
        },
      ]
    `);
  });
});
