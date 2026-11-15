import { Capacity, CargoWeight } from '@civ-clone/core-unit-transport/Yields';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { Game } from '@civ-clone/core-game/Game';
import { ITransport } from '@civ-clone/core-unit-transport/Transport';
import Naval from '@civ-clone/base-unit-type-naval/Naval';
import NavalTransport from '@civ-clone/base-unit-type-naval-transport/NavalTransport';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Submarine from '../Submarine';
import Tile from '@civ-clone/core-world/Tile';
import TransportRegistry from '@civ-clone/core-unit-transport/TransportRegistry';
import Unit from '@civ-clone/core-unit/Unit';
import UnitYield from '@civ-clone/core-unit/Rules/Yield';
import YieldValue from '@civ-clone/core-yield/Yield';
import { expect } from 'chai';
import CanStow from '@civ-clone/core-unit-transport/Rules/CanStow';

// The Submarine as a `NavalTransport` (civ-clone/web-renderer#1007, M2b): Civ2's carries missiles, Civ1's carries
//  nothing. A ruleset that gives it no hold (Civ1) must see the same unit as before.

// What the Submarine was before it became a transport.
class NavalSubmarine extends Naval {}
class Passenger extends Unit {}

const setup = () => {
  const ruleRegistry = new RuleRegistry(),
    transportRegistry = new TransportRegistry(),
    args: [null, Player, Tile, RuleRegistry, TransportRegistry] = [
      null,
      null as unknown as Player,
      null as unknown as Tile,
      ruleRegistry,
      transportRegistry,
    ];

  // As civ1-unit's: the cargo weight is what is aboard, for every unit.
  ruleRegistry.register(
    new UnitYield(
      new Criterion(
        (unit: Unit, unitYield: YieldValue): unitYield is CargoWeight =>
          unitYield instanceof CargoWeight
      ),
      new Effect((unit: Unit, unitYield: YieldValue): void =>
        unitYield.set(
          transportRegistry.getByTransport(unit as unknown as ITransport).length
        )
      )
    )
  );

  return { args, ruleRegistry, transportRegistry };
};

describe('Submarine as a NavalTransport', (): void => {
  it('is a naval transport', (): void => {
    const { args } = setup(),
      submarine = new Submarine(...args);

    expect(submarine).instanceOf(NavalTransport);
    expect(submarine).instanceOf(Naval);
  });

  it('has no room and stows nothing when the ruleset gives it no hold', (): void => {
    const { args, transportRegistry } = setup(),
      submarine = new Submarine(...args),
      passenger = new Passenger(
        null,
        null as unknown as Player,
        null as unknown as Tile
      );

    expect(submarine.capacity().value()).equal(0);
    expect(submarine.hasCapacity()).false;
    expect(submarine.hasCargo()).false;
    expect(submarine.cargo()).deep.equal([]);
    expect(submarine.stow(passenger, null as unknown as Tile)).false;
    expect(transportRegistry.entries()).deep.equal([]);
  });

  it('carries what the ruleset gives it room for', (): void => {
    const { args, ruleRegistry } = setup(),
      submarine = new Submarine(...args),
      passenger = new Passenger(
        null,
        null as unknown as Player,
        null as unknown as Tile
      );

    ruleRegistry.register(
      new UnitYield(
        new Criterion(
          (unit: Unit, unitYield: YieldValue): unitYield is Capacity =>
            unitYield instanceof Capacity
        ),
        new Criterion((unit: Unit): boolean => unit instanceof Submarine),
        new Effect((unit: Unit, unitYield: YieldValue): void =>
          unitYield.set(8)
        )
      ),
      new CanStow(
        new Effect(
          (transport: ITransport, unit: Unit): boolean =>
            unit instanceof Passenger
        )
      )
    );

    expect(submarine.stow(passenger, null as unknown as Tile)).true;
    expect(submarine.cargo()).deep.equal([passenger]);
  });

  it('saves and sends exactly what it did as a plain naval unit', (): void => {
    const { args } = setup(),
      submarine = new Submarine(...args),
      before = new NavalSubmarine(...args);

    expect(submarine.stateKeys()).deep.equal(before.stateKeys());
    expect(submarine.keys()).deep.equal(before.keys());
  });

  it('gets its transport collaborators from Game.inject when loaded from a save made before it was a transport', (): void => {
    const game = new Game(),
      { args } = setup(),
      before = new NavalSubmarine(...args) as unknown as Record<
        string,
        unknown
      >,
      // What a save written before this change holds for a Submarine: its saved fields, restored onto the class as it
      //  is now without running the constructor, as core-save-game's `hydrate` does.
      loaded = Object.create(Submarine.prototype) as Submarine;

    new NavalSubmarine(...args).stateKeys().forEach((key: string): void => {
      (loaded as unknown as Record<string, unknown>)[key] = before[key];
    });

    game.inject(loaded);

    expect(
      (loaded as unknown as { _transportRegistry: unknown })._transportRegistry
    ).equal(game.transports);
    expect(
      (loaded as unknown as { _transportRuleRegistry: unknown })
        ._transportRuleRegistry
    ).equal(game.rules);
    expect(loaded.hasCargo()).false;
    expect(loaded.cargo()).deep.equal([]);
  });
});
