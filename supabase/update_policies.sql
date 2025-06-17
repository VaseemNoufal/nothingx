-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON teams;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON teams;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON teams;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON members;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON members;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON members;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON xp_submissions;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON xp_submissions;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON xp_submissions;

-- Create new policies that allow public read access
-- Teams policies
CREATE POLICY "Enable public read access for teams"
ON teams FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON teams FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
ON teams FOR DELETE
TO authenticated
USING (true);

-- Members policies
CREATE POLICY "Enable public read access for members"
ON members FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON members FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
ON members FOR DELETE
TO authenticated
USING (true);

-- XP Submissions policies
CREATE POLICY "Enable public read access for xp_submissions"
ON xp_submissions FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON xp_submissions FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
ON xp_submissions FOR DELETE
TO authenticated
USING (true); 