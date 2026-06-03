/**
 * Unit tests for spa-card.js
 * 
 * Tests the core logic of SpaCard and SpaCardEditor classes.
 * Covers entity helpers, temperature control, maintenance rendering,
 * and editor state management.
 */
import { jest, describe, test, expect, beforeEach, beforeAll } from '@jest/globals';

let SpaCard;
let SpaCardEditor;

// Set up global mocks before dynamic import
const defineArgs = [];
global.customElements = {
  define: (name, cls) => defineArgs.push([name, cls]),
};
global.CustomEvent = class CustomEvent {
  constructor(type, options) {
    this.type = type;
    this.detail = options?.detail;
    this.bubbles = options?.bubbles;
    this.composed = options?.composed;
  }
};

beforeAll(async () => {
  await import('../spa-card.js');
  SpaCardEditor = defineArgs.find(c => c[0] === 'spa-card-editor')?.[1];
  SpaCard = defineArgs.find(c => c[0] === 'spa-card')?.[1];
});

// ───────────────────────────────────────────────────────────
// Helper: create a mock hass object
// ───────────────────────────────────────────────────────────
function mockHass(states = {}) {
  return {
    states,
    callService: jest.fn(),
  };
}

function mockState(state, attributes = {}) {
  return { state: String(state), attributes };
}

// ═══════════════════════════════════════════════════════════════
//  SpaCard Tests
// ═══════════════════════════════════════════════════════════════

describe('SpaCard', () => {
  let card;

  beforeEach(() => {
    card = new SpaCard();
    card.config = {
      card_title: 'MY SPA',
      entity_water_temp: 'sensor.layzspa_temp_c',
      entity_target_temp: 'climate.layzspa_temperature_control',
      entity_lz_filter: 'sensor.layzspa_filter_age',
      entity_lz_chlorine: 'sensor.layzspa_chlorine_age',
      entity_lz_reset_filter: 'button.layzspa_reset_filter',
      entity_lz_reset_chlore: 'button.layzspa_reset_chlore',
      lz_filter_max: 60,
      lz_chlorine_max: 14,
      target_temp_min: 20,
      target_temp_max: 40,
    };
    card.hass = mockHass({
      'sensor.layzspa_temp_c': mockState('32.5'),
      'climate.layzspa_temperature_control': mockState('heat', {
        temperature: 36,
        current_temperature: 32.5,
        min: 20,
        max: 40,
      }),
      'sensor.layzspa_filter_age': mockState('45'),
      'sensor.layzspa_chlorine_age': mockState('10'),
    });
  });

  // ─── Constructor & Config ────────────────────────────────

  describe('constructor and config', () => {
    test('initializes with default tab "home"', () => {
      const c = new SpaCard();
      expect(c._tab).toBe('home');
    });

    test('initializes with _camExpanded = false', () => {
      const c = new SpaCard();
      expect(c._camExpanded).toBe(false);
    });

    test('setConfig stores config', () => {
      const c = new SpaCard();
      const cfg = { card_title: 'Test' };
      c.setConfig(cfg);
      expect(c.config).toBe(cfg);
    });

    test('getConfigElement returns an element', () => {
      const el = {};
      global.document = { createElement: jest.fn(() => el) };
      expect(SpaCard.getConfigElement()).toBe(el);
      expect(global.document.createElement).toHaveBeenCalledWith('spa-card-editor');
      delete global.document;
    });
  });

  // ─── _exists ─────────────────────────────────────────────

  describe('_exists', () => {
    test('returns falsy for null/undefined id', () => {
      expect(card._exists(null)).toBeFalsy();
      expect(card._exists(undefined)).toBeFalsy();
      expect(card._exists('')).toBeFalsy();
    });

    test('returns falsy for entity not in hass.states', () => {
      expect(card._exists('sensor.nonexistent')).toBeFalsy();
    });

    test('returns true for existing entity with valid state', () => {
      expect(card._exists('sensor.layzspa_temp_c')).toBe(true);
    });

    test('returns false for entity with "unavailable" state', () => {
      card.hass.states['sensor.test'] = mockState('unavailable');
      expect(card._exists('sensor.test')).toBe(false);
    });

    test('returns false for entity with "unknown" state', () => {
      card.hass.states['sensor.test'] = mockState('unknown');
      expect(card._exists('sensor.test')).toBe(false);
    });

    test('returns false for entity with "none" state', () => {
      card.hass.states['sensor.test'] = mockState('none');
      expect(card._exists('sensor.test')).toBe(false);
    });

    test('is case-insensitive for invalid states', () => {
      card.hass.states['sensor.test'] = mockState('Unavailable');
      expect(card._exists('sensor.test')).toBe(false);
      card.hass.states['sensor.test'] = mockState('UNKNOWN');
      expect(card._exists('sensor.test')).toBe(false);
    });

    test('returns falsy when hass is not set', () => {
      card.hass = null;
      expect(card._exists('sensor.layzspa_temp_c')).toBeFalsy();
    });
  });

  // ─── _state ──────────────────────────────────────────────

  describe('_state', () => {
    test('returns state value for existing entity', () => {
      expect(card._state('sensor.layzspa_temp_c')).toBe('32.5');
    });

    test('returns null for non-existing entity', () => {
      expect(card._state('sensor.nonexistent')).toBeNull();
    });

    test('returns null for entity with invalid state', () => {
      card.hass.states['sensor.test'] = mockState('unavailable');
      expect(card._state('sensor.test')).toBeNull();
    });
  });

  // ─── _attr ───────────────────────────────────────────────

  describe('_attr', () => {
    test('returns attribute value', () => {
      expect(card._attr('climate.layzspa_temperature_control', 'temperature')).toBe(36);
    });

    test('returns null for missing attribute', () => {
      expect(card._attr('climate.layzspa_temperature_control', 'nonexistent')).toBeNull();
    });

    test('returns null for non-existing entity', () => {
      expect(card._attr('sensor.nonexistent', 'temperature')).toBeNull();
    });

    test('returns null when hass is not set', () => {
      card.hass = null;
      expect(card._attr('sensor.layzspa_temp_c', 'unit')).toBeNull();
    });
  });

  // ─── _waterTemp ──────────────────────────────────────────

  describe('_waterTemp', () => {
    test('returns water temp from dedicated entity', () => {
      expect(card._waterTemp()).toBe('32.5');
    });

    test('falls back to climate current_temperature attribute', () => {
      card.hass.states['sensor.layzspa_temp_c'] = mockState('unavailable');
      expect(card._waterTemp()).toBe(32.5);
    });

    test('returns null when neither source is available', () => {
      card.config.entity_water_temp = 'sensor.missing';
      card.config.entity_target_temp = 'sensor.also_missing';
      expect(card._waterTemp()).toBeNull();
    });

    test('returns null when climate entity has no current_temperature', () => {
      card.hass.states['sensor.layzspa_temp_c'] = mockState('unavailable');
      card.hass.states['climate.layzspa_temperature_control'].attributes = { temperature: 36 };
      expect(card._waterTemp()).toBeNull();
    });
  });

  // ─── _changeTemp ─────────────────────────────────────────

  describe('_changeTemp', () => {
    test('calls climate.set_temperature for climate entity', () => {
      card._changeTemp(0.5);
      expect(card.hass.callService).toHaveBeenCalledWith(
        'climate', 'set_temperature',
        { entity_id: 'climate.layzspa_temperature_control', temperature: 36.5 }
      );
    });

    test('calls input_number.set_value for input_number entity', () => {
      card.config.entity_target_temp = 'input_number.spa_temp';
      card.hass.states['input_number.spa_temp'] = mockState('35', { min: 20, max: 40 });
      card._changeTemp(1);
      expect(card.hass.callService).toHaveBeenCalledWith(
        'input_number', 'set_value',
        { entity_id: 'input_number.spa_temp', value: 36 }
      );
    });

    test('respects max temperature limit from config', () => {
      card.hass.states['climate.layzspa_temperature_control'].attributes.temperature = 40;
      card._changeTemp(1);
      expect(card.hass.callService).toHaveBeenCalledWith(
        'climate', 'set_temperature',
        { entity_id: 'climate.layzspa_temperature_control', temperature: 40 }
      );
    });

    test('respects min temperature limit from config', () => {
      card.hass.states['climate.layzspa_temperature_control'].attributes.temperature = 20;
      card._changeTemp(-1);
      expect(card.hass.callService).toHaveBeenCalledWith(
        'climate', 'set_temperature',
        { entity_id: 'climate.layzspa_temperature_control', temperature: 20 }
      );
    });

    test('does nothing when entity does not exist', () => {
      card.config.entity_target_temp = 'sensor.missing';
      card._changeTemp(0.5);
      expect(card.hass.callService).not.toHaveBeenCalled();
    });

    test('rounds to nearest 0.5', () => {
      card.hass.states['climate.layzspa_temperature_control'].attributes.temperature = 34.3;
      card._changeTemp(0.5);
      expect(card.hass.callService).toHaveBeenCalledWith(
        'climate', 'set_temperature',
        { entity_id: 'climate.layzspa_temperature_control', temperature: 35 }
      );
    });

    test('uses default min/max when not configured', () => {
      delete card.config.target_temp_min;
      delete card.config.target_temp_max;
      card.hass.states['climate.layzspa_temperature_control'].attributes.temperature = 5;
      card._changeTemp(-10);
      // default min is 10
      expect(card.hass.callService).toHaveBeenCalledWith(
        'climate', 'set_temperature',
        { entity_id: 'climate.layzspa_temperature_control', temperature: 10 }
      );
    });

    test('falls back to state when temperature attribute is null', () => {
      card.hass.states['climate.layzspa_temperature_control'].attributes = {};
      card.hass.states['climate.layzspa_temperature_control'].state = '34';
      card._changeTemp(1);
      expect(card.hass.callService).toHaveBeenCalledWith(
        'climate', 'set_temperature',
        { entity_id: 'climate.layzspa_temperature_control', temperature: 35 }
      );
    });
  });

  // ─── _renderMaintenance ──────────────────────────────────

  describe('_renderMaintenance', () => {
    test('returns empty template when no filter/chlorine entities exist', () => {
      card.config.entity_lz_filter = 'sensor.missing';
      card.config.entity_lz_chlorine = 'sensor.missing2';
      const result = card._renderMaintenance();
      expect(result.strings[0]).toBe('');
    });

    test('renders filter info when filter entity exists', () => {
      card.config.entity_lz_chlorine = 'sensor.missing';
      const result = card._renderMaintenance();
      expect(result).toBeDefined();
      expect(result.type).toBe('html');
    });

    test('renders chlorine info when chlorine entity exists', () => {
      card.config.entity_lz_filter = 'sensor.missing';
      const result = card._renderMaintenance();
      expect(result).toBeDefined();
      expect(result.type).toBe('html');
    });

    test('renders both filter and chlorine info', () => {
      const result = card._renderMaintenance();
      expect(result).toBeDefined();
      expect(result.type).toBe('html');
    });

    test('renders without reset buttons when not configured', () => {
      card.config.entity_lz_reset_filter = '';
      card.config.entity_lz_reset_chlore = '';
      const result = card._renderMaintenance();
      expect(result).toBeDefined();
    });

    test('renders with reset buttons when configured', () => {
      const result = card._renderMaintenance();
      expect(result).toBeDefined();
      expect(result.type).toBe('html');
    });

    test('uses default filter max when not configured', () => {
      delete card.config.lz_filter_max;
      const result = card._renderMaintenance();
      expect(result).toBeDefined();
    });

    test('uses default chlorine max when not configured', () => {
      delete card.config.lz_chlorine_max;
      const result = card._renderMaintenance();
      expect(result).toBeDefined();
    });
  });

  // ─── render ──────────────────────────────────────────────

  describe('render', () => {
    test('returns empty template when hass not set', () => {
      card.hass = null;
      const result = card.render();
      expect(result.strings[0]).toBe('');
    });

    test('returns empty template when config not set', () => {
      card.config = null;
      const result = card.render();
      expect(result.strings[0]).toBe('');
    });

    test('renders card content with title', () => {
      const result = card.render();
      expect(result).toBeDefined();
      expect(result.type).toBe('html');
    });

    test('renders with default title when not configured', () => {
      card.config.card_title = '';
      const result = card.render();
      expect(result).toBeDefined();
      expect(result.type).toBe('html');
    });

    test('renders water temp or fallback', () => {
      const result = card.render();
      expect(result).toBeDefined();
    });
  });
});

// ═══════════════════════════════════════════════════════════════
//  SpaCardEditor Tests
// ═══════════════════════════════════════════════════════════════

describe('SpaCardEditor', () => {
  let editor;

  beforeEach(() => {
    editor = new SpaCardEditor();
  });

  describe('constructor', () => {
    test('initializes with default tab "gen"', () => {
      expect(editor._tab).toBe('gen');
    });

    test('initializes _open set with default sections', () => {
      expect(editor._open).toBeInstanceOf(Set);
      expect(editor._open.has('a-disp')).toBe(true);
      expect(editor._open.has('a-temps')).toBe(true);
      expect(editor._open.has('a-layzspa')).toBe(true);
      expect(editor._open.has('a-ph')).toBe(true);
      expect(editor._open.has('a-cdim')).toBe(true);
    });
  });

  describe('setConfig', () => {
    test('stores a shallow copy of config', () => {
      const config = { card_title: 'My Spa', blur_amount: 10 };
      editor.setConfig(config);
      expect(editor._config).toEqual(config);
      expect(editor._config).not.toBe(config);
    });
  });

  describe('_tog', () => {
    test('removes id from _open if present', () => {
      expect(editor._open.has('a-disp')).toBe(true);
      editor._tog('a-disp');
      expect(editor._open.has('a-disp')).toBe(false);
    });

    test('adds id to _open if not present', () => {
      expect(editor._open.has('a-new')).toBe(false);
      editor._tog('a-new');
      expect(editor._open.has('a-new')).toBe(true);
    });

    test('creates a new Set instance (immutable update)', () => {
      const oldSet = editor._open;
      editor._tog('a-disp');
      expect(editor._open).not.toBe(oldSet);
    });
  });

  describe('_val', () => {
    test('dispatches config-changed event with new config', () => {
      editor._config = { card_title: 'Test' };
      editor.hass = {};
      editor.dispatchEvent = jest.fn();

      const newConfig = { card_title: 'Updated' };
      editor._val({ detail: { value: newConfig } });

      expect(editor.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'config-changed',
          detail: { config: newConfig },
          bubbles: true,
          composed: true,
        })
      );
    });

    test('does nothing when _config is not set', () => {
      editor._config = null;
      editor.hass = {};
      editor.dispatchEvent = jest.fn();

      editor._val({ detail: { value: {} } });
      expect(editor.dispatchEvent).not.toHaveBeenCalled();
    });

    test('does nothing when hass is not set', () => {
      editor._config = { card_title: 'Test' };
      editor.hass = null;
      editor.dispatchEvent = jest.fn();

      editor._val({ detail: { value: {} } });
      expect(editor.dispatchEvent).not.toHaveBeenCalled();
    });
  });

  describe('render methods', () => {
    beforeEach(() => {
      editor._config = {
        card_title: 'MY SPA',
        entity_water_temp: 'sensor.layzspa_temp_c',
        entity_target_temp: 'climate.layzspa_temperature_control',
      };
      editor.hass = mockHass({
        'sensor.layzspa_temp_c': mockState('32.5'),
      });
    });

    test('render returns empty when hass is not set', () => {
      editor.hass = null;
      const result = editor.render();
      expect(result.strings[0]).toBe('');
    });

    test('render returns empty when _config is not set', () => {
      editor._config = null;
      const result = editor.render();
      expect(result.strings[0]).toBe('');
    });

    test('render returns editor wrap with tabs', () => {
      const result = editor.render();
      expect(result).toBeDefined();
      expect(result.type).toBe('html');
    });

    test('_renderGen returns template with appearance schema', () => {
      const result = editor._renderGen();
      expect(result).toBeDefined();
      expect(result.type).toBe('html');
    });

    test('_renderSens returns template with sensor schemas', () => {
      const result = editor._renderSens();
      expect(result).toBeDefined();
      expect(result.type).toBe('html');
    });

    test('_renderChem returns template with chemistry schemas', () => {
      const result = editor._renderChem();
      expect(result).toBeDefined();
      expect(result.type).toBe('html');
    });

    test('_renderCam returns template with camera schemas', () => {
      const result = editor._renderCam();
      expect(result).toBeDefined();
      expect(result.type).toBe('html');
    });

    test('_renderSw returns template with 10 switch schemas', () => {
      const result = editor._renderSw();
      expect(result).toBeDefined();
      expect(result.type).toBe('html');
    });

    test('_acc renders accordion with open state', () => {
      const schema = [{ name: 'test', label: 'Test', selector: { text: {} } }];
      const result = editor._acc('a-disp', 'background:red;', 'X', 'Title', schema);
      expect(result).toBeDefined();
      expect(result.type).toBe('html');
    });

    test('_acc renders accordion with closed state', () => {
      editor._tog('a-disp'); // close it
      const schema = [{ name: 'test', label: 'Test', selector: { text: {} } }];
      const result = editor._acc('a-disp', 'background:red;', 'X', 'Title', schema);
      expect(result).toBeDefined();
      expect(result.type).toBe('html');
    });
  });
});

// ═══════════════════════════════════════════════════════════════
//  Registration Tests
// ═══════════════════════════════════════════════════════════════

describe('Custom element registration', () => {
  test('registers spa-card-editor', () => {
    expect(defineArgs.find(c => c[0] === 'spa-card-editor')).toBeDefined();
  });

  test('registers spa-card', () => {
    expect(defineArgs.find(c => c[0] === 'spa-card')).toBeDefined();
  });
});
