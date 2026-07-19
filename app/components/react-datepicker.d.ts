declare module 'react-datepicker' {
  import { Component } from 'react';

  export interface ReactDatePickerProps {
    selected?: Date | null;
    onChange: (date: Date | null) => void;
    dateFormat?: string;
    showMonthYearPicker?: boolean;
    showTimeSelect?: boolean;
    timeIntervals?: number;
    placeholderText?: string;
    className?: string;
    maxDate?: Date;
    minDate?: Date | null;
    disabled?: boolean;
  }

  export default class DatePicker extends Component<ReactDatePickerProps> {}
}
