import Naval from '@civ-clone/base-unit-type-naval/Naval';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Submarine from '../Submarine';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import { expect } from 'chai';

// A naval unit with nothing of its own, to compare the Submarine with: what a game saves of one is what it saves of
//  any naval unit.
class PlainNaval extends Naval {}

const unitArgs = (
  ruleRegistry: RuleRegistry = new RuleRegistry()
): [null, Player, Tile, RuleRegistry] => [
  null,
  null as unknown as Player,
  null as unknown as Tile,
  ruleRegistry,
];

describe('Submarine', (): void => {
  it('is a naval unit', (): void => {
    const submarine = new Submarine(...unitArgs());

    expect(submarine).instanceOf(Naval);
    expect(submarine).instanceOf(Unit);
  });

  it('saves exactly what any naval unit saves', (): void => {
    expect(new Submarine(...unitArgs()).stateKeys()).deep.equal(
      new PlainNaval(...unitArgs()).stateKeys()
    );
  });

  it('sends the client exactly what any naval unit sends', (): void => {
    expect(new Submarine(...unitArgs()).keys()).deep.equal(
      new PlainNaval(...unitArgs()).keys()
    );
  });
});
