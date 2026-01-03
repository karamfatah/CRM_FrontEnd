import React, { useState, useEffect } from 'react';
import { categoryService } from '../../lib/categoryService';
import ModalSearch from '../../components/ModalSearch';
import ThemeToggle from '../../components/ThemeToggle';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  console.log('Category component rendered');

  useEffect(() => {
    console.log('useEffect triggered to fetch categories');
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      console.log('Fetching categories from API');
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'Present' : 'Missing');
      const data = await categoryService.getCategories();
      console.log('Categories received:', data);
      setCategories(data);
      setError('');
    } catch (err) {
      console.error('Error fetching categories:', err.message);
      setError('Failed to fetch categories. Please check your login status or try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    console.log('Editing category:', category);
    setEditingCategory(category);
    setName(category.name);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    console.log('Updating category:', { id: editingCategory.id, name });
    try {
      await categoryService.updateCategory(editingCategory.id, { name });
      console.log('Category updated successfully');
      setEditingCategory(null);
      setName('');
      fetchCategories();
    } catch (err) {
      console.error('Error updating category:', err.message);
      setError('Failed to update category. Please try again.');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main>
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 font-bold">Categoriess</h1>
              </div>
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                <ModalSearch />
                <ThemeToggle />
              </div>
            </div>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            {loading ? (
              <div className="text-gray-600">Loading categories...</div>
            ) : categories.length === 0 ? (
              <div className="text-gray-600">No categories available.</div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="bg-white shadow-lg rounded-sm border border-gray-200 p-4"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-gray-800 font-medium">{category.name}</span>
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-sm text-indigo-500 hover:text-indigo-600"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {editingCategory && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h2 className="text-xl font-bold mb-4">Edit Category</h2>
                  <form onSubmit={handleUpdate}>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                        Category Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingCategory(null)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Category;