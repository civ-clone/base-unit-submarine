"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Submarine = void 0;
const NavalTransport_1 = require("@civ-clone/base-unit-type-naval-transport/NavalTransport");
// A transport, so a ruleset can give it a hold (Civ2's carries missiles). It carries nothing until the ruleset's rules
//  say so: with no `Capacity` yield rule for it, its capacity is 0, so it has no room, and with no `Carries` trait, no
//  `CanStow` rule accepts anything.
class Submarine extends NavalTransport_1.default {
}
exports.Submarine = Submarine;
exports.default = Submarine;
//# sourceMappingURL=Submarine.js.map