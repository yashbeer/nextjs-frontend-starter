'use client';

import { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [activeTeam, setActiveTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      const storedTeams = localStorage.getItem('teams');
      const storedActiveTeam = localStorage.getItem('activeTeam');

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedTeams) {
        setTeams(JSON.parse(storedTeams));
      }
      if (storedActiveTeam) {
        setActiveTeam(JSON.parse(storedActiveTeam));
      }
      else {
        setActiveTeam(teams[0])
      }
      setLoading(false);
    }
  }, []);

  const updateUser = (newUser) => {
    setUser(newUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(newUser));
    }
  };

  const updateTeams = (newTeamsOrCallback) => {
    setTeams((prevTeams) => {
      let updatedTeams;

      if (typeof newTeamsOrCallback === 'function') {
        updatedTeams = newTeamsOrCallback(prevTeams);
      } else {
        updatedTeams = newTeamsOrCallback;
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('teams', JSON.stringify(updatedTeams));
      }

      return updatedTeams;
    });
  };

  const updateActiveTeam = (team) => {
    setActiveTeam(team);
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeTeam', JSON.stringify(team));
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser: updateUser, teams, setTeams: updateTeams, loading,activeTeam,
        setActiveTeam: updateActiveTeam }}>
      {!loading && children} {/* Render children only when loading is complete */}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
