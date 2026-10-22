-- Structural seed. Catalogue data lives in src/lib/data/seed-products.ts
-- (derived from the client's publicly listed products — see Intelligence
-- Report §4) and is loaded via the admin UI or a one-off import script.
insert into site_content (id, announcement_text, announcement_on, footer_note)
values (1, '', false, 'Prices are confirmed at enquiry — Mediview Pharmacy, Wuse 2, Abuja.')
on conflict (id) do nothing;
