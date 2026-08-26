import { LuSearch } from 'react-icons/lu';

const SearchBar = ({ value, onChange, placeholder = 'Search symbol or company…' }) => (
  <div className="relative">
    <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-mist" size={18} />
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="input-field pl-10"
    />
  </div>
);

export default SearchBar;
