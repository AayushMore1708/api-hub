import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SearchBar from '@/components/Searchbar'
import { searchAPI } from '@/services/search'

// Mock the search API
vi.mock('@/services/search', () => ({
  searchAPI: vi.fn(),
}))

describe('SearchBar Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()
  })

  it('renders the search input and button', () => {
    render(<SearchBar />)
    
    expect(screen.getByPlaceholderText('Search API docs...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
  })

  it('updates input value when typing', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)
    
    const input = screen.getByPlaceholderText('Search API docs...')
    await user.type(input, 'react hooks')
    
    expect(input).toHaveValue('react hooks')
  })

  it('calls searchAPI with correct query when search button is clicked', async () => {
    const mockResults = [
      { title: 'React Hooks API', link: 'https://example.com/hooks' },
      { title: 'useState Hook', link: 'https://example.com/usestate' },
    ]
    
    vi.mocked(searchAPI).mockResolvedValue(mockResults)
    
    const user = userEvent.setup()
    render(<SearchBar />)
    
    const input = screen.getByPlaceholderText('Search API docs...')
    const button = screen.getByRole('button', { name: /search/i })
    
    await user.type(input, 'react hooks')
    await user.click(button)
    
    expect(searchAPI).toHaveBeenCalledWith('react hooks')
    expect(searchAPI).toHaveBeenCalledTimes(1)
  })

  it('displays search results after successful search', async () => {
    const mockResults = [
      { title: 'React Hooks API', link: 'https://example.com/hooks' },
      { title: 'useState Hook', link: 'https://example.com/usestate' },
    ]
    
    vi.mocked(searchAPI).mockResolvedValue(mockResults)
    
    const user = userEvent.setup()
    render(<SearchBar />)
    
    const input = screen.getByPlaceholderText('Search API docs...')
    const button = screen.getByRole('button', { name: /search/i })
    
    await user.type(input, 'react hooks')
    await user.click(button)
    
    await waitFor(() => {
      expect(screen.getByText('React Hooks API')).toBeInTheDocument()
      expect(screen.getByText('useState Hook')).toBeInTheDocument()
    })
    
    // Check if links are rendered correctly
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAttribute('href', 'https://example.com/hooks')
    expect(links[1]).toHaveAttribute('href', 'https://example.com/usestate')
  })

  it('shows loading state during search', async () => {
    vi.mocked(searchAPI).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve([]), 100))
    )
    
    const user = userEvent.setup()
    render(<SearchBar />)
    
    const input = screen.getByPlaceholderText('Search API docs...')
    const button = screen.getByRole('button', { name: /search/i })
    
    await user.type(input, 'test query')
    await user.click(button)
    
    // Check loading state
    expect(screen.getByRole('button', { name: /searching/i })).toBeInTheDocument()
    expect(button).toBeDisabled()
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^search$/i })).toBeInTheDocument()
    })
  })

  it('disables button during loading', async () => {
    vi.mocked(searchAPI).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve([]), 100))
    )
    
    const user = userEvent.setup()
    render(<SearchBar />)
    
    const input = screen.getByPlaceholderText('Search API docs...')
    const button = screen.getByRole('button', { name: /search/i })
    
    await user.type(input, 'test')
    await user.click(button)
    
    expect(button).toBeDisabled()
    
    await waitFor(() => {
      expect(button).not.toBeDisabled()
    })
  })

  it('displays alert on search failure', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    vi.mocked(searchAPI).mockRejectedValue(new Error('API Error'))
    
    const user = userEvent.setup()
    render(<SearchBar />)
    
    const input = screen.getByPlaceholderText('Search API docs...')
    const button = screen.getByRole('button', { name: /search/i })
    
    await user.type(input, 'test')
    await user.click(button)
    
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Search failed')
    })
    
    alertSpy.mockRestore()
  })

  it('renders empty results list initially', () => {
    render(<SearchBar />)
    
    const list = screen.getByRole('list')
    expect(list).toBeInTheDocument()
    expect(list).toBeEmptyDOMElement()
  })

  it('clears previous results when new search is performed', async () => {
    const firstResults = [
      { title: 'First Result', link: 'https://example.com/first' },
    ]
    const secondResults = [
      { title: 'Second Result', link: 'https://example.com/second' },
    ]
    
    vi.mocked(searchAPI)
      .mockResolvedValueOnce(firstResults)
      .mockResolvedValueOnce(secondResults)
    
    const user = userEvent.setup()
    render(<SearchBar />)
    
    const input = screen.getByPlaceholderText('Search API docs...')
    const button = screen.getByRole('button', { name: /search/i })
    
    // First search
    await user.type(input, 'first')
    await user.click(button)
    
    await waitFor(() => {
      expect(screen.getByText('First Result')).toBeInTheDocument()
    })
    
    // Clear input and do second search
    await user.clear(input)
    await user.type(input, 'second')
    await user.click(button)
    
    await waitFor(() => {
      expect(screen.getByText('Second Result')).toBeInTheDocument()
      expect(screen.queryByText('First Result')).not.toBeInTheDocument()
    })
  })

  it('maintains loading state correctly on error', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    vi.mocked(searchAPI).mockRejectedValue(new Error('API Error'))
    
    const user = userEvent.setup()
    render(<SearchBar />)
    
    const input = screen.getByPlaceholderText('Search API docs...')
    const button = screen.getByRole('button', { name: /search/i })
    
    await user.type(input, 'test')
    await user.click(button)
    
    await waitFor(() => {
      expect(button).not.toBeDisabled()
      expect(screen.getByRole('button', { name: /^search$/i })).toBeInTheDocument()
    })
    
    alertSpy.mockRestore()
  })

  it('renders links with correct security attributes', async () => {
    const mockResults = [
      { title: 'Test Result', link: 'https://example.com/test' },
    ]
    
    vi.mocked(searchAPI).mockResolvedValue(mockResults)
    
    const user = userEvent.setup()
    render(<SearchBar />)
    
    const input = screen.getByPlaceholderText('Search API docs...')
    const button = screen.getByRole('button', { name: /search/i })
    
    await user.type(input, 'test')
    await user.click(button)
    
    await waitFor(() => {
      const link = screen.getByRole('link', { name: 'Test Result' })
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })
})
