# Capability: Staff Operations, HR & Internal Noticeboard

## Overview
Staff attendance clock in/out, automated monthly salary calculation, end-of-day daily work summaries, company announcement noticeboard, and team internal order chat.

## Requirements

### Requirement 1: Attendance Clock In/Out & Salary Formula
* Staff MUST be able to punch clock-in and clock-out with timestamp on `/portal/staff-hr`.
* The system MUST calculate monthly salary using the standard formula:
  $$\text{Monthly Payout} = \frac{\text{Base Salary}}{\text{Total Days in Month}} \times (\text{Present Days} + \text{Paid Leaves}) - \text{Deductions}$$

#### Scenario: Staff clocks in at work
* **Given** an authenticated staff member on `/portal/staff-hr`
* **When** they click `"Clock In"`
* **Then** an `Attendance` record is created for today's date with the current timestamp and status `"PRESENT"`.

### Requirement 2: Daily Work Log Submission
* Staff MUST be able to submit an end-of-day summary detailing tasks completed (e.g. number of sarees inspected, orders packed, customer queries resolved).
* Admin users with `staff:payroll_manage` MUST be able to review historical work logs per staff member.

### Requirement 3: Internal Noticeboard & Order Remarks
* Admin users with `announcements:post` MUST be able to broadcast urgent announcements with read receipts.
* Staff MUST be able to attach internal operational remarks to any order record.
