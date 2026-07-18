import type { Meta, StoryObj } from '@storybook/react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '../pagination';

const meta: Meta<typeof Pagination> = {
  title: 'Components/Pagination',
  component: Pagination,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious onClick={() => {}} />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink page={1} onClick={() => {}} />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink page={2} isActive onClick={() => {}} />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink page={3} onClick={() => {}} />
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink page={10} onClick={() => {}} />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext onClick={() => {}} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};

export const FirstPage: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious disabled />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink page={1} isActive onClick={() => {}} />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink page={2} onClick={() => {}} />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink page={3} onClick={() => {}} />
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink page={20} onClick={() => {}} />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext onClick={() => {}} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};

export const LastPage: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious onClick={() => {}} />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink page={1} onClick={() => {}} />
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink page={18} onClick={() => {}} />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink page={19} onClick={() => {}} />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink page={20} isActive onClick={() => {}} />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext disabled />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};

export const SmallSize: Story = {
  render: () => (
    <Pagination size="sm">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious label="Prev" onClick={() => {}} />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink page={1} onClick={() => {}} />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink page={2} isActive onClick={() => {}} />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink page={3} onClick={() => {}} />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext onClick={() => {}} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};

export const NoEllipsis: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious onClick={() => {}} />
        </PaginationItem>
        {[1, 2, 3, 4, 5].map((p) => (
          <PaginationItem key={p}>
            <PaginationLink page={p} isActive={p === 3} onClick={() => {}} />
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext onClick={() => {}} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};
