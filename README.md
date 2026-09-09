# IX-Machines

Federated garage inventory → agent-swarm builds → GYST UUIDv8 labels → shipping hops.

**Live target:** https://ix-machines.somacosf.com

## What it is

Groups upload parts, BOMs, and photos of labels/serials. Five agents (Cataloger, Matcher, Designer, Shipper, Foreman) walk the live pool, rank recipes that can actually be built from inventoried SKUs, open project UUIDs, route CAD to Onshape / KiCad / Flux / FreeCAD / OpenSCAD against that library, and stage crate + hop labels between benches.

Identity is infrastructure. Every lot, crate, hop, build, and agent turn is a 128-bit GYST UUIDv8.
