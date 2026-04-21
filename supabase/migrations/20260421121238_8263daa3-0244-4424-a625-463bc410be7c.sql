
CREATE OR REPLACE FUNCTION public.perform_checkin(_beach_slug TEXT, _visitor_handle TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, extensions
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
  _payload_hash := encode(extensions.digest(_payload, 'sha256'), 'hex');
  _tx_hash := '0x' || encode(extensions.digest(_prev || _payload_hash || _block::text, 'sha256'), 'hex');

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
