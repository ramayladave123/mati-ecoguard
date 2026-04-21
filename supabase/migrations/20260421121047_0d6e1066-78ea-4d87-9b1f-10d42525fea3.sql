
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'staff');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Beaches / sites
CREATE TABLE public.beaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  capacity INT NOT NULL DEFAULT 100,
  current_count INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open', -- open, halted
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.beaches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view beaches" ON public.beaches
  FOR SELECT USING (true);

CREATE POLICY "Admins manage beaches" ON public.beaches
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Checkins (the simulated blockchain ledger)
CREATE TABLE public.checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beach_id UUID REFERENCES public.beaches(id) ON DELETE CASCADE NOT NULL,
  visitor_handle TEXT NOT NULL,
  block_number BIGINT NOT NULL,
  tx_hash TEXT NOT NULL UNIQUE,
  prev_hash TEXT NOT NULL,
  payload_hash TEXT NOT NULL,
  carbon_grams NUMERIC NOT NULL DEFAULT 0.8,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_checkins_beach_created ON public.checkins(beach_id, created_at DESC);
CREATE INDEX idx_checkins_block ON public.checkins(block_number DESC);

CREATE POLICY "Anyone can view checkins" ON public.checkins
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert checkins" ON public.checkins
  FOR INSERT WITH CHECK (true);

-- Atomic check-in function: validates capacity, computes hash chain, inserts row
CREATE OR REPLACE FUNCTION public.perform_checkin(_beach_slug TEXT, _visitor_handle TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _beach public.beaches%ROWTYPE;
  _last public.checkins%ROWTYPE;
  _block BIGINT;
  _prev TEXT;
  _payload TEXT;
  _payload_hash TEXT;
  _tx_hash TEXT;
  _new_id UUID;
BEGIN
  SELECT * INTO _beach FROM public.beaches WHERE slug = _beach_slug FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('status','error','reason','beach_not_found');
  END IF;
  IF _beach.status = 'halted' THEN
    RETURN jsonb_build_object('status','blocked','reason','halted','beach',row_to_json(_beach));
  END IF;
  IF _beach.current_count >= _beach.capacity THEN
    RETURN jsonb_build_object('status','blocked','reason','at_capacity','beach',row_to_json(_beach));
  END IF;

  SELECT * INTO _last FROM public.checkins ORDER BY block_number DESC LIMIT 1;
  IF FOUND THEN
    _block := _last.block_number + 1;
    _prev := _last.tx_hash;
  ELSE
    _block := 1;
    _prev := '0x0000000000000000000000000000000000000000000000000000000000000000';
  END IF;

  _payload := _beach.id::text || '|' || _visitor_handle || '|' || extract(epoch from now())::text;
  _payload_hash := encode(digest(_payload, 'sha256'), 'hex');
  _tx_hash := '0x' || encode(digest(_prev || _payload_hash || _block::text, 'sha256'), 'hex');

  INSERT INTO public.checkins(beach_id, visitor_handle, block_number, tx_hash, prev_hash, payload_hash)
  VALUES (_beach.id, _visitor_handle, _block, _tx_hash, _prev, _payload_hash)
  RETURNING id INTO _new_id;

  UPDATE public.beaches
    SET current_count = current_count + 1, updated_at = now()
    WHERE id = _beach.id
    RETURNING * INTO _beach;

  RETURN jsonb_build_object(
    'status','minted',
    'checkin_id', _new_id,
    'block_number', _block,
    'tx_hash', _tx_hash,
    'prev_hash', _prev,
    'beach', row_to_json(_beach)
  );
END;
$$;

-- Need pgcrypto for digest
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Realtime
ALTER TABLE public.beaches REPLICA IDENTITY FULL;
ALTER TABLE public.checkins REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.beaches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.checkins;

-- Auto-grant admin role to first signup (for demo) via trigger on user_roles? Simpler: do nothing, admin role assigned manually by SQL. But for app self-signup of admin, use a function.
CREATE OR REPLACE FUNCTION public.handle_new_admin()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'admin')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_admin();

-- Seed beaches
INSERT INTO public.beaches(slug, name, description, location, latitude, longitude, capacity, image_url) VALUES
  ('dahican', 'Dahican Beach', 'Crescent-shaped white-sand surf beach famed for skimboarding and pawikan turtles.', 'Mati City, Davao Oriental', 6.9697, 126.2733, 250, null),
  ('pujada-bay', 'Pujada Bay', 'One of the world''s most beautiful bays with coral gardens and quiet coves.', 'Mati City', 6.8800, 126.2400, 180, null),
  ('mayo-bay', 'Mayo Bay', 'Sheltered cove popular for kayaking and sunrise paddles.', 'Mati City', 6.9400, 126.2900, 120, null),
  ('waniban-island', 'Waniban Island', 'Tiny island with turquoise waters, ideal for snorkeling.', 'Pujada Bay, Mati', 6.8430, 126.2580, 80, null),
  ('sleeping-dinosaur', 'Sleeping Dinosaur Viewpoint', 'Iconic Mt. Hamiguitan ridge viewpoint over Pujada Bay.', 'Badas, Mati', 6.8700, 126.2200, 60, null),
  ('subangan-museum', 'Subangan Museum', 'Heritage museum featuring the 53-ft sperm whale skeleton.', 'City Hall Compound, Mati', 6.9550, 126.2160, 100, null);
