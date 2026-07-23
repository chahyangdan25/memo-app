import { supabase } from './supabaseClient'

export async function fetchNotes() {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createNote(content, userId) {
  const { data, error } = await supabase
    .from('notes')
    .insert({ content, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateNote(id, content) {
  const { data, error } = await supabase
    .from('notes')
    .update({ content })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteNote(id) {
  const { error } = await supabase.from('notes').delete().eq('id', id)
  if (error) throw error
}
