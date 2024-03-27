import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

function Dashboard() {
  const [result, setResult] = useState();
  const [isopen, setIsopen] = useState(false);
  const [fullcode, setfullcode] = useState();

  const getData = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API}/get-data`);
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
    <div className={`relative overflow-x-auto min-h-[100vh]`}>
      <table
        className={`w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 ${
          isopen ? "blur-sm" : ""
        } `}
      >
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
            <th scope="col" className="px-6 py-3">
              Code
            </th>
            <th scope="col" className="px-6 py-3">
              Output
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
                  <td className="px-6 py-4">{user.createdAt}</td>
                  <td className="px-0 py-4">
                    {user.code.length > 100 ? (
                      <>
                        <span>{user.code.slice(0, 100)}</span>

                        <button
                          onClick={() => {
                            setIsopen(true);
                            setfullcode(user.code);
                          }}
                          className="text-blue-300 hover:text-blue-500"
                        >
                          &nbsp;more...
                        </button>
                      </>
                    ) : (
                      user.code
                    )}
                  </td>
                  <td className="px-6 py-4">{user.output}</td>
                </tr>
              );
            })
          ) : (
            <div>No data</div>
          )}
        </tbody>
      </table>
      {isopen && (
        <div class="absolute left-[400px] top-[100px] w-[700px] p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
          <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Code
          </h5>
          <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">
            {fullcode}
          </p>
          <button
            onClick={() => {
              setIsopen(false);
            }}
            class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
