import { useEffect, useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";
import { useItemsContext } from "../context/ItemsContext";
import { ITEM_STATUS } from "../utils/constants";

const HomePage = () => {
  const { items, isLoading, error, successMessage, fetchItems, createItem, updateItem, deleteItem } =
    useItemsContext();
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.name.trim()) return;

    await createItem({
      name: formData.name.trim(),
      description: formData.description.trim(),
      status: ITEM_STATUS.ACTIVE
    });

    setFormData({ name: "", description: "" });
  };

  const toggleStatus = async (item) => {
    const nextStatus =
      item.status === ITEM_STATUS.ACTIVE ? ITEM_STATUS.ARCHIVED : ITEM_STATUS.ACTIVE;
    await updateItem(item._id, { status: nextStatus });
  };

  return (
    <div className="space-y-4">
      <Card title="Create Item">
        <form onSubmit={handleSubmit} className="grid gap-3">
          <Input
            label="Name"
            name="name"
            placeholder="Enter item name"
            value={formData.name}
            onChange={handleChange}
          />
          <Input
            label="Description"
            name="description"
            placeholder="Enter item description"
            value={formData.description}
            onChange={handleChange}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Add Item"}
          </Button>
        </form>
      </Card>

      <Card title="Items">
        {error && <p className="mb-3 rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        {successMessage && (
          <p className="mb-3 rounded bg-green-50 p-2 text-sm text-green-700">{successMessage}</p>
        )}
        {isLoading && items.length === 0 && <p className="text-slate-600">Loading items...</p>}
        {!isLoading && items.length === 0 && <p className="text-slate-600">No items available.</p>}

        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item._id}
              className="flex flex-col gap-2 rounded-md border border-slate-200 p-3 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-medium text-slate-800">{item.name}</p>
                {item.description && <p className="text-sm text-slate-600">{item.description}</p>}
                <p className="text-xs uppercase tracking-wide text-slate-500">{item.status}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => toggleStatus(item)} disabled={isLoading}>
                  Toggle Status
                </Button>
                <Button variant="danger" onClick={() => deleteItem(item._id)} disabled={isLoading}>
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

export default HomePage;
