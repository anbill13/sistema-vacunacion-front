import { useState, useEffect } from 'react';
import { jsonService } from '../services/jsonService';

export const useJsonData = (endpoint, method = 'GET', params = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await jsonService.getData(endpoint, method, params);
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, method, params]); 

  const updateData = async (newData, updateMethod = 'POST') => {
    try {
      const result = await jsonService.saveData(endpoint, updateMethod, newData);
      if (result) {
        const updatedData = await jsonService.getData(endpoint, 'GET', params);
        setData(updatedData);
        return true;
      }
      return false;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  return { data, loading, error, updateData };
};