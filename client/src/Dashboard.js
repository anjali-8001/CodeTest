import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

function Dashboard() {
  const [result, setResult] = useState();

  const getData = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/get-data`);
      if (res?.data.success) {
        setResult(res?.data.result);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    console.log(result);
  }, [result]);
  return (
    <div>
      <div className="relative overflow-x-auto ">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Username
              </th>
              <th scope="col" className="px-6 py-3">
                Language
              </th>
              <th scope="col" className="px-6 py-3">
                Stdin
              </th>
              <th scope="col" className="px-6 py-3">
                Time Stamps
              </th>
              <th scope="col" className="px-0 py-3">
                Code
              </th>
            </tr>
          </thead>
          <tbody>
            {result && result.length > 0 ? (
              result.map((user) => {
                return (
                  <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                    >
                      {user.username}
                    </th>
                    <td className="px-6 py-4">{user.language}</td>
                    <td className="px-6 py-4">{user.stdin}</td>
                    <td className="px-6 py-4">{user.created_at}</td>
                    <td className="px-0 py-4">
                      {user.code.length > 100
                        ? user.code.slice(0, 100) + "..."
                        : user.code}
                    </td>
                  </tr>
                );
              })
            ) : (
              <div>No data</div>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
