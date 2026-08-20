# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary user: the project's creator, using LAN Drop for real day-to-day file transfers between a Windows PC and an Android phone on the same home Wi-Fi network. Secondary audience: developers and recruiters evaluating this project as part of a public "50 projects in 50 days" build challenge.

## Product Purpose

Eliminates the small, frequent friction of moving a file between two devices already on the same local network, without cloud storage, messaging apps, email, or a USB cable. Success means a file selected on one device arrives byte-for-byte intact on the target device in seconds, with a confirmation the sender can trust.

## Positioning

Unlike AirDrop (Apple-only) or cloud transfer tools (WeTransfer, Google Drive) that need an account, internet access, or a matching ecosystem, LAN Drop works between any devices sharing a LAN through nothing but a browser — no install, no sign-in, no data leaving the network.

## Operating Context

Real-world use is a Windows PC running the LAN Drop Node.js server, opened from the PC's own browser and from an Android phone's browser on the same Wi-Fi. Devices discover each other automatically via UDP broadcast; no manual IP entry or QR scanning is needed in normal use.

## Capabilities and Constraints

- Automatic peer discovery on the LAN (UDP broadcast, ~3s interval, peers expire after ~12s of silence).
- Direct file relay between LAN Drop instances with SHA-256 integrity verification; the sender only sees "delivered" after the receiver validates the checksum.
- Runs as a Node.js process; a phone participates as a browser client of a PC-hosted instance rather than running its own instance.
- No cloud, no accounts, no data leaving the local network.

## Brand Commitments

Project name "LAN Drop" is fixed. It is Project 01 of a public "50 projects in 50 days" series — each project lives in its own folder and should read as a complete, deliberately finished piece of work on its own, not a shared template reused across the series.

## Evidence on Hand

No existing logo, screenshots, testimonials, or press. Nothing in the design should fabricate usage data, review quotes, or metrics that don't exist.

## Product Principles

- Zero friction: no accounts, no installs beyond the one-time server start, no manual network configuration.
- Trust through verification: never imply a transfer succeeded without a checksum match confirming it.
- Local-only, always: no feature should require or imply an internet/cloud dependency.
- Portfolio-grade craft: as Project 01 of 50, the finish should read as intentional and specific to what LAN Drop is, not a generic dark-SaaS template.
