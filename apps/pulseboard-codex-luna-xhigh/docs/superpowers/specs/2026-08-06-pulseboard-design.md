# Pulseboard design

## Product shape

Pulseboard is a small team-pulse product: one private workspace per new account, a quick mood + note composer, and a dashboard that makes the team's current signal easy to scan. Phase 1 intentionally keeps the data model small: Better Auth's user/session/account/verification tables plus workspaces, members, and pulses.

## Experience

The visual language is a dark signal room: deep ink surfaces, thin borders, Inter typography, and a lime status accent supported by blue and orange mood signals. The landing page explains the value with a restrained orbit preview. Auth pages use a split pitch/form layout. The signed-in shell uses a desktop rail that collapses to a mobile drawer, with Overview, Pulses, and Settings as the only workspace views.

Dashboard is the default signed-in route. It shows member count, pulses today, pulses this week, a recent pulse feed, and the composer side by side on wide screens. Pulses is the full list plus composer. Settings provides the smallest useful workspace control: owner-only rename. Empty and mutation error states are written as product copy, not generic placeholders. A theme toggle persists the user's preference.

## Architecture and data flow

TanStack Start owns routing, SSR, server functions, and the API route. Better Auth uses the Drizzle adapter against PostgreSQL and its TanStack Start cookie plugin. All private reads and writes are `createServerFn` handlers that retrieve the current session from request headers and then query Drizzle. The `/app` route protects navigation and bootstraps a personal workspace before loading dashboard data; handler-level session checks remain the actual data boundary.

Pulse creation validates mood and a 280-character body before inserting a row. The router is invalidated after a successful mutation, so the dashboard aggregates and feed update together. Workspace rename reuses the same pattern and updates the readable slug. Drizzle schema and a checked-in initial SQL migration define the Better Auth and product tables.

## Verification

The pure domain helpers are covered with Vitest: slug normalization and pulse body limits. The app's typecheck and production build exercise route generation, server-function transforms, client bundles, and SSR bundles. Docker Compose supplies PostgreSQL and the app with environment wiring for end-to-end validation in phase 2.
