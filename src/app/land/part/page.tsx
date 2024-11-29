'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';  // Assuming you're using react-toastify for notifications

const LandParticipatorPage = () => {
  const [lands, setLands] = useState<any[]>([]);
  const [participators, setParticipators] = useState<any[]>([]);
  const [landParticipators, setLandParticipators] = useState<any[]>([]);
  const [selectedLand, setSelectedLand] = useState<number | null>(null);
  const [selectedParticipator, setSelectedParticipator] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [landNames, setLandNames] = useState<{ [key: number]: string }>({});
  const [participatorNames, setParticipatorNames] = useState<{ [key: number]: string }>({});
  const router = useRouter();

  const token = localStorage.getItem('token'); // Retrieve token from localStorage

  // Function to add token to headers for fetch requests
  const getAuthHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch Land and Participator names
  const fetchLandName = async (landId: number) => {
    if (landNames[landId]) return; // Skip if already fetched
    try {
      const res = await fetch(`/api/land/${landId}`, { headers: getAuthHeaders() });
      if (!res.ok) {
        throw new Error('Failed to fetch land data');
      }
      const data = await res.json();
      setLandNames((prev) => ({ ...prev, [landId]: data.name }));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchParticipatorName = async (participatorId: number) => {
    if (participatorNames[participatorId]) return; // Skip if already fetched
    try {
      const res = await fetch(`/api/participator/${participatorId}`, { headers: getAuthHeaders() });
      if (!res.ok) {
        throw new Error('Failed to fetch participator data');
      }
      const data = await res.json();
      setParticipatorNames((prev) => ({ ...prev, [participatorId]: data.name }));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchLandsAndParticipators = async () => {
      try {
        const landRes = await fetch('/api/land', { headers: getAuthHeaders() });
        const participatorRes = await fetch('/api/participator', { headers: getAuthHeaders() });
        const landPartRes = await fetch('/api/participator/assoc', { headers: getAuthHeaders() });

        if (!landRes.ok || !participatorRes.ok || !landPartRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const landData = await landRes.json();
        const participatorData = await participatorRes.json();
        const landPartData = await landPartRes.json();

        setLands(landData);
        setParticipators(participatorData);
        setLandParticipators(landPartData); // Set land-participator data

        // Fetch names for land and participators
        landPartData.forEach((assoc: any) => {
          fetchLandName(assoc.landId);
          fetchParticipatorName(assoc.participatorId);
        });
      } catch (error) {
        toast.error('Failed to fetch lands, participators, or associations');
      }
    };

    fetchLandsAndParticipators();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLand || !selectedParticipator) {
      toast.error('Please select both land and participator');
      return;
    }

    setIsLoading(true);

    try {
      if (!token) {
        toast.error('Authorization required');
        setIsLoading(false);
        return;
      }

      // Check if this is an existing association for update
      const existingAssociation = landParticipators.find(
        (assoc) => assoc.landId === selectedLand && assoc.participatorId === selectedParticipator
      );

      const response = await fetch('/api/participator/assoc', {
        method: existingAssociation ? 'PUT' : 'POST', // Determine whether to create or update
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          id: existingAssociation?.id,  // Include ID for update
          landId: selectedLand,
          participatorId: selectedParticipator,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create or update land-participator association');
      }

      toast.success('Land-Participator association updated successfully');
      router.push('/land/part'); // Redirect to a list of associations
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Select Land and Participator</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Land Selection */}
        <div>
          <label htmlFor="land" className="block text-sm font-medium text-gray-700">
            Land
          </label>
          <select
            id="land"
            name="land"
            className="mt-2 block w-full p-2 border border-gray-300 rounded-md"
            value={selectedLand || ''}
            onChange={(e) => setSelectedLand(Number(e.target.value))}
          >
            <option value="" disabled>Select a Land</option>
            {lands.map((land) => (
              <option key={land.id} value={land.id}>
                {land.name} ({land.location})
              </option>
            ))}
          </select>
        </div>

        {/* Participator Selection */}
        <div>
          <label htmlFor="participator" className="block text-sm font-medium text-gray-700">
            Participator
          </label>
          <select
            id="participator"
            name="participator"
            className="mt-2 block w-full p-2 border border-gray-300 rounded-md"
            value={selectedParticipator || ''}
            onChange={(e) => setSelectedParticipator(Number(e.target.value))}
          >
            <option value="" disabled>Select a Participator</option>
            {participators.map((participator) => (
              <option key={participator.id} value={participator.id}>
                {participator.name}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <div className="mt-4">
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>

      {/* Land-Participator Associations Table */}
      <h2 className="text-xl font-semibold mt-8 mb-4">Existing Land-Participator Associations</h2>
      <div className="overflow-x-auto bg-white shadow rounded-md">
        <table className="min-w-full table-auto">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Land Name</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Participator Name</th>
            </tr>
          </thead>
          <tbody>
            {landParticipators.map((association) => (
              <tr key={association.id}>
                <td className="px-4 py-2">{landNames[association.landId] || 'Loading...'}</td>
                <td className="px-4 py-2">{participatorNames[association.participatorId] || 'Loading...'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LandParticipatorPage;
