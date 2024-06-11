"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import SearchBar from "../../../components/SearchBar";
import Pagination from "../../../components/Pagination";
import ContactsTable from "../../../components/ContactsTable";
import Modal from "../../../components/Modal"; // Import the Modal component
import { useContacts } from "../../../hooks/useContacts";

const ITEMS_PER_PAGE = 7;

export default function Signin() {
  const { data: session, status } = useSession();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [currentNotes, setCurrentNotes] = useState("");
  const [currentCustomerName, setCurrentCustomerName] = useState("");
  const router = useRouter();

  const { contacts, error, revalidate } = useContacts();

  const deleteContact = async (id) => {
    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        revalidate();
      } else {
        const errorData = await response.json();
        alert(`Failed to delete contact: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
      alert("Failed to delete contact");
    }
  };

  const editContact = (id) => {
    router.push(`/auth/editlead?id=${id}`);
  };

  const showNotes = (id) => {
    const contact = contacts.find((contact) => contact._id === id);
    if (contact) {
      setCurrentCustomerName(contact.name);
      setCurrentNotes(contact.notes || "No notes available");
      setShowNotesModal(true);
    }
  };

  const closeNotesModal = () => {
    setShowNotesModal(false);
    setCurrentNotes("");
    setCurrentCustomerName("");
  };

  useEffect(() => {
    revalidate();
  }, []);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleSort = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const sortedContacts = contacts?.sort((a, b) => {
    const nameA = a.name.split(" ").pop().toLowerCase();
    const nameB = b.name.split(" ").pop().toLowerCase();
    if (sortOrder === "asc") {
      return nameA.localeCompare(nameB);
    }
    return nameB.localeCompare(nameA);
  });

  const filteredContacts = sortedContacts?.filter((contact) => contact.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (status === "loading" || !contacts) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error loading contacts: {error.message}</p>;
  }

  if (!session || !session.user.email) {
    return null;
  }

  const totalPages = Math.ceil(filteredContacts.length / ITEMS_PER_PAGE);
  const paginatedContacts = filteredContacts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <SearchBar searchTerm={searchTerm} onSearch={handleSearch} />
      <div className="overflow-hidden rounded-lg border border-gray-200 shadow-md w-full">
        {paginatedContacts.length > 0 ? (
          <ContactsTable contacts={paginatedContacts} onDelete={deleteContact} onEdit={editContact} onShowNotes={showNotes} onSort={handleSort} />
        ) : (
          <div className="flex items-center justify-center p-4">
            <div className="flex flex-col items-center">
              <div className="p-3 mx-auto text-gray-200 bg-blue-100 rounded-full dark:bg-sky-900">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <h1 className="mt-3 text-lg text-gray-800 dark:text-gray-800">No contacts found</h1>
              <p className="mt-2 text-gray-500 dark:text-gray-500">Your search did not match any contacts. Please try again or create a new contact.</p>
            </div>
          </div>
        )}
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>
      <Modal show={showNotesModal} onClose={closeNotesModal} customerName={currentCustomerName}>
        <p>{currentNotes}</p>
      </Modal>
    </div>
  );
}
