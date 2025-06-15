import { useState, useEffect } from 'react';
import { jsonService } from '../services/jsonService';

export const useJsonData = (endpoint, method = 'GET') => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = jsonService.getData(endpoint, method);
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, method]);

  const updateData = async (newData) => {
    try {
      jsonService.saveData(endpoint, method, newData);
      setData(newData);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  return { data, loading, error, updateData };
};
