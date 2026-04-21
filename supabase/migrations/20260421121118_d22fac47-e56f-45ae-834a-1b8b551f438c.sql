
DROP POLICY "Anyone can insert checkins" ON public.checkins;
-- No INSERT policy means direct inserts are blocked; only SECURITY DEFINER perform_checkin can write.
