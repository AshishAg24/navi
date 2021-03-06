import { module, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { setupRenderingTest } from 'ember-qunit';
import { A as arr } from '@ember/array';
import { clickTrigger, selectChoose } from 'ember-power-select/test-support/helpers';
import { settled, render } from '@ember/test-helpers';

module('Integration | Component | dashboard dimension selector', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders with right options', async function(assert) {
    assert.expect(3);

    const dashboard = {
      widgets: Promise.resolve([
        {
          requests: arr([
            {
              logicalTable: {
                table: {
                  id: 'a',
                  dimensions: [
                    { id: 'dim1', name: 'dim1', category: 'cat1' },
                    { id: 'dim2', name: 'dim2', category: 'cat2' }
                  ]
                },
                timeGrain: 'day'
              }
            }
          ])
        },

        {
          requests: arr([
            {
              logicalTable: {
                table: {
                  id: 'b',
                  dimensions: [
                    { id: 'dim3', name: 'dim3', category: 'cat2' },
                    { id: 'dim1', name: 'dim1', category: 'cat1' }
                  ]
                },
                timeGrain: 'day'
              }
            }
          ])
        }
      ])
    };

    this.set('dashboard', dashboard);

    this.set('changeme', function(selection) {
      assert.deepEqual(
        selection,
        { dimension: 'dim1', name: 'dim1', tables: ['a', 'b'], dataSource: 'dummy' },
        'Selection sends correct dimension object'
      );
    });

    await render(hbs`{{dashboard-dimension-selector dashboard=dashboard onChange=changeme}}`);

    await settled();

    await clickTrigger();

    const dropdown = document.querySelector('.ember-basic-dropdown-content');

    assert.deepEqual(
      structure(dropdown),
      { cat1: ['dim1'], cat2: ['dim2', 'dim3'] },
      'Correct select structure is shown'
    );

    assert.dom('.ember-power-select-placeholder').hasText('Select a Dimension');

    await selectChoose('.ember-power-select-trigger', 'dim1');
  });

  test('it renders multi-datasource widgets with right options', async function(assert) {
    assert.expect(1);
    const dashboard = {
      widgets: Promise.resolve([
        {
          requests: arr([
            {
              dataSource: 'dummy',
              logicalTable: {
                table: {
                  id: 'a',
                  dimensions: [
                    { id: 'dim1', name: 'dim1', category: 'cat1' },
                    { id: 'dim2', name: 'dim2', category: 'cat2' }
                  ]
                },
                timeGrain: 'day'
              }
            }
          ])
        },

        {
          requests: arr([
            {
              dataSource: 'blockhead',
              logicalTable: {
                table: {
                  id: 'b',
                  dimensions: [
                    { id: 'dim3', name: 'dim3', category: 'cat3' },
                    { id: 'dim4', name: 'dim4', category: 'cat1' },
                    { id: 'dim2', name: 'dim2', category: 'cat4' }
                  ]
                },
                timeGrain: 'day'
              }
            }
          ])
        }
      ])
    };

    this.set('dashboard', dashboard);

    this.set('changeme', () => undefined);

    await this.render(hbs`{{dashboard-dimension-selector dashboard=dashboard onChange=changeme}}`);

    await settled();

    await clickTrigger();

    const dropdown = document.querySelector('.ember-basic-dropdown-content');

    assert.deepEqual(
      structure(dropdown),
      { 'cat1 (blockhead)': ['dim4'], 'cat1 (dummy)': ['dim1'], cat2: ['dim2'], cat3: ['dim3'], cat4: ['dim2'] },
      'Correct select structure is shown'
    );
  });
});

const structure = dropdown =>
  [...dropdown.querySelectorAll('.ember-power-select-group')].reduce((obj, el) => {
    const key = el.querySelector('.ember-power-select-group-name').textContent.trim();
    const value = [...el.querySelectorAll('.ember-power-select-option')].map(el => el.textContent.trim());
    return Object.assign({}, obj, { [key]: value });
  }, {});
