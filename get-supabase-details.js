// Script to help construct the correct DATABASE_URL for Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://obrmdheqleyqeduvvkkf.supabase.co';
const projectId = supabaseUrl.replace('https://', '').replace('.supabase.co', '');

console.log('Supabase Project Details:');
console.log('Project ID:', projectId);
console.log('Host:', `db.${projectId}.supabase.co`);
console.log('');
console.log('To complete the migration, you need to:');
console.log('1. Go to your Supabase dashboard');
console.log('2. Go to Settings > Database');
console.log('3. Get the Connection string (URI format)');
console.log('4. Update DATABASE_URL in .env.local');
console.log('');
console.log('The format should be:');
console.log(`postgresql://postgres:[YOUR-PASSWORD]@db.${projectId}.supabase.co:5432/postgres`);