"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Submarine = void 0;
const NavalTransport_1 = require("@civ-clone/base-unit-type-naval-transport/NavalTransport");
// A transport, so a ruleset can give it a hold (for missiles, say). It carries nothing until the ruleset's rules say
//  so: with no `Capacity` yield rule for it, its capacity is 0, so it never has room and `stow` refuses. That is the
//  only guard. With no `Carries` trait, no `CanStow` rule applies to it, and `canStow()` (every applicable rule agrees)
//  is then true for any unit, so anything asking whether it can carry a unit must also ask `hasCapacity()`.
class Submarine extends NavalTransport_1.default {
}
exports.Submarine = Submarine;
exports.default = Submarine;
//# sourceMappingURL=Submarine.js.map