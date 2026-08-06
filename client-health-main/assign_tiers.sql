-- ============================================================
-- Tier assignments for Algorithm Agency client portfolio
-- Run in Supabase SQL editor
-- Tier A = strategic/large, B = mid-size, C = smaller
-- ============================================================

-- Tier A — strategic accounts
UPDATE public.clients SET tier = 'A' WHERE name = 'Vodacom';
UPDATE public.clients SET tier = 'A' WHERE name = 'MTN Shop';
UPDATE public.clients SET tier = 'A' WHERE name = 'Dis-Chem';
UPDATE public.clients SET tier = 'A' WHERE name = 'Dis-Chem Health';
UPDATE public.clients SET tier = 'A' WHERE name = 'Baby City';
UPDATE public.clients SET tier = 'A' WHERE name = 'CTM :: Italtile';
UPDATE public.clients SET tier = 'A' WHERE name = 'Coronation';
UPDATE public.clients SET tier = 'A' WHERE name = 'Liberty';
UPDATE public.clients SET tier = 'A' WHERE name = 'Bidvest Bank';
UPDATE public.clients SET tier = 'A' WHERE name = 'Unilever';
UPDATE public.clients SET tier = 'A' WHERE name = 'GHD';
UPDATE public.clients SET tier = 'A' WHERE name = 'Subaru SA';

-- Tier B — mid-size accounts
UPDATE public.clients SET tier = 'B' WHERE name = 'Environ SA & Global';
UPDATE public.clients SET tier = 'B' WHERE name = 'SoluGrowth SA';
UPDATE public.clients SET tier = 'B' WHERE name = 'SoluGrowth USA';
UPDATE public.clients SET tier = 'B' WHERE name = 'Buco';
UPDATE public.clients SET tier = 'B' WHERE name = '1Life';
UPDATE public.clients SET tier = 'B' WHERE name = 'Servest';
UPDATE public.clients SET tier = 'B' WHERE name = 'Biogen';
UPDATE public.clients SET tier = 'B' WHERE name = 'Tyrewide';
UPDATE public.clients SET tier = 'B' WHERE name = 'Dial a Bed';
UPDATE public.clients SET tier = 'B' WHERE name = 'Malas';
UPDATE public.clients SET tier = 'B' WHERE name = 'Nolands';
UPDATE public.clients SET tier = 'B' WHERE name = 'Karongwe';
UPDATE public.clients SET tier = 'B' WHERE name = 'Living Fit';
UPDATE public.clients SET tier = 'B' WHERE name = 'Thanda';
UPDATE public.clients SET tier = 'B' WHERE name = 'Bridgement';
UPDATE public.clients SET tier = 'B' WHERE name = 'Angel Shack';
UPDATE public.clients SET tier = 'B' WHERE name = 'Strategix SA & UK';
UPDATE public.clients SET tier = 'B' WHERE name = 'Concord Access Solutions';
UPDATE public.clients SET tier = 'B' WHERE name = 'Concord Cranes';
UPDATE public.clients SET tier = 'B' WHERE name = 'Uni-Span';
UPDATE public.clients SET tier = 'B' WHERE name = 'Aluminium Prodigy';
UPDATE public.clients SET tier = 'B' WHERE name = 'Oliso';

-- Tier C — smaller accounts
UPDATE public.clients SET tier = 'C' WHERE name = 'AMKA :: Sta-Sof-Fro';
UPDATE public.clients SET tier = 'C' WHERE name = 'AMKA :: Stylin Dredz';
UPDATE public.clients SET tier = 'C' WHERE name = 'AMKA :: Sheen';
UPDATE public.clients SET tier = 'C' WHERE name = 'AMKA :: Color Rebel';
UPDATE public.clients SET tier = 'C' WHERE name = 'AMKA :: Easy Waves';
UPDATE public.clients SET tier = 'C' WHERE name = 'AMKA :: MPL';
UPDATE public.clients SET tier = 'C' WHERE name = 'AMKA :: Bump Patrol';
UPDATE public.clients SET tier = 'C' WHERE name = 'Knysna Lifestyle Estate';
UPDATE public.clients SET tier = 'C' WHERE name = 'Future Fortune';
UPDATE public.clients SET tier = 'C' WHERE name = 'M7 :: All';
UPDATE public.clients SET tier = 'C' WHERE name = 'Ster-Kinekor';
UPDATE public.clients SET tier = 'C' WHERE name = 'Payflex';
UPDATE public.clients SET tier = 'C' WHERE name = 'Quorum various';
UPDATE public.clients SET tier = 'C' WHERE name = 'Stanlib';
UPDATE public.clients SET tier = 'C' WHERE name = 'Timbercity';
UPDATE public.clients SET tier = 'C' WHERE name = 'One Day Only';
UPDATE public.clients SET tier = 'C' WHERE name = 'Subaru';

-- Catch-all: assign Tier C to any remaining clients with no tier
UPDATE public.clients SET tier = 'C' WHERE tier IS NULL OR tier = '';

-- Verify result
SELECT name, tier, ci_leads FROM public.clients ORDER BY tier, name;
