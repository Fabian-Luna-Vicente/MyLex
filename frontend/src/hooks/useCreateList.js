import { useState } from 'react';

export function useCreateList(onCreate, onClose) {
  const [listName, setListName] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!listName.trim()) return;

    setLoading(true);
    try {
      await onCreate({ name: listName, privacy, language });
      setListName('');
      setPrivacy('public');
      setLanguage('English');
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    listName,
    setListName,
    privacy,
    setPrivacy,
    language,
    setLanguage,
    loading,
    handleSubmit
  };
}
