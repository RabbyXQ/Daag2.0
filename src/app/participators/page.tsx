"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface Participator {
  id: string;
  name: string;
  relation: string;
  part: number; // Updated field to 'part' instead of 'portion'
}

const ParticipatorsPage = () => {
  const [participators, setParticipators] = useState<Participator[]>([]);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [part, setPart] = useState<number>(0); // Updated to 'part'
  const [editingParticipator, setEditingParticipator] = useState<Participator | null>(null);
  const router = useRouter();

  const fetchParticipators = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/participator', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setParticipators(response.data);
    } catch (error) {
      console.error('Error fetching participators:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      if (editingParticipator) {
        // Update existing participator
        await axios.put('/api/participator', {
          id: editingParticipator.id,
          name,
          relation,
          part, // Send 'part' value as a number
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        // Add new participator
        await axios.post('/api/participator', {
          name,
          relation,
          part, // Send 'part' value as a number
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      setName('');
      setRelation('');
      setPart(0); // Reset 'part' field to 0
      setEditingParticipator(null);
      fetchParticipators();
    } catch (error) {
      console.error('Error submitting participator:', error);
    }
  };

  const handleEdit = (participator: Participator) => {
    setName(participator.name);
    setRelation(participator.relation);
    setPart(participator.part); // Set 'part' when editing
    setEditingParticipator(participator);
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('token');

    try {
      await axios.delete('/api/participator', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { id },
      });
      fetchParticipators();
    } catch (error) {
      console.error('Error deleting participator:', error);
    }
  };

  useEffect(() => {
    fetchParticipators();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-700 mb-6">Participators</h1>

      <form onSubmit={handleSubmit} className="flex items-center mb-6 space-x-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="border border-gray-300 rounded-md p-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <input
          type="text"
          value={relation}
          onChange={(e) => setRelation(e.target.value)}
          placeholder="Relation"
          className="border border-gray-300 rounded-md p-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <input
          type="number" // Use number input for 'part'
          value={part}
          onChange={(e) => setPart(Number(e.target.value) || 0)} // Convert to number
          placeholder="Part"
          className="border border-gray-300 rounded-md p-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-md transition-all"
        >
          {editingParticipator ? 'Update' : 'Add'}
        </button>
      </form>

      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Participators List</h2>
      <ul className="space-y-3">
        {participators.map((participator) => (
          <li
            key={participator.id}
            className="flex justify-between items-center bg-white p-4 rounded-md shadow-sm hover:shadow-md transition-all"
          >
            <span className="text-gray-700 font-medium">
              {participator.name} - {participator.relation} - Part: {participator.part} // Display 'part'
            </span>
            <div className="space-x-2">
              <button
                onClick={() => handleEdit(participator)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md transition-all"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(participator.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition-all"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ParticipatorsPage;
