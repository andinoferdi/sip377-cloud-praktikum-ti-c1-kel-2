"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import ChatActionMenu from "./ChatActionMenu";
import type { ChatContact, ChatMessage } from "./types";

type ChatConversationProps = {
  contact: ChatContact;
  messages: ChatMessage[];
  messageInput: string;
  onMessageInputChange: (value: string) => void;
  onSendMessage: () => void;
  onOpenMobileSidebar: () => void;};

export default function ChatConversation({
  contact,
  messages,
  messageInput,
  onMessageInputChange,
  onSendMessage,
  onOpenMobileSidebar,
}: ChatConversationProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [contact.id, messages]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--token-gray-200)] bg-[var(--token-white)] dark:border-[var(--color-border-dark-soft)] dark:bg-[var(--color-surface-dark-elevated)]">
      <div className="sticky flex items-center justify-between border-b border-[var(--token-gray-200)] px-5 py-4 dark:border-[var(--color-border-dark-soft)] xl:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--token-gray-300)] text-[var(--token-gray-700)] transition hover:bg-[var(--token-gray-100)] dark:border-[var(--color-border-dark-strong)] dark:text-[var(--token-gray-400)] dark:hover:bg-[var(--token-white-3)] xl:hidden"
            aria-label="Open contact list"
          >
            <HamburgerIcon />
          </button>

          <div className="relative h-12 w-full max-w-[48px] rounded-full">
            <Image
              src={contact.avatar}
              alt={`${contact.name} profile`}
              width={48}
              height={48}
              className="h-full w-full overflow-hidden rounded-full object-cover object-center"
            />
            <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full border-[1.5px] border-[var(--token-white)] bg-success-500 dark:border-[var(--token-gray-900)]" />
          </div>
          <div>
            <h5 className="text-sm font-medium text-[var(--token-gray-800)] dark:text-[var(--token-white-90)]">
              {contact.name}
            </h5>
            <p className="text-theme-xs text-[var(--token-gray-500)] dark:text-[var(--token-gray-400)]">
              {contact.role}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="text-[var(--token-gray-700)] hover:text-brand-500 dark:text-[var(--token-gray-400)] dark:hover:text-[var(--token-white-90)]"
            aria-label="Voice call"
          >
            <PhoneIcon />
          </button>
          <button
            type="button"
            className="text-[var(--token-gray-700)] hover:text-brand-500 dark:text-[var(--token-gray-400)] dark:hover:text-[var(--token-white-90)]"
            aria-label="Video call"
          >
            <VideoIcon />
          </button>
          <ChatActionMenu />
        </div>
      </div>

      <div
        className="custom-scrollbar flex-1 space-y-6 overflow-auto p-5 xl:space-y-8 xl:p-6"
        role="log"
        aria-live="polite"
        aria-label={`Messages with ${contact.name}`}
      >
        {messages.map((message) => {
          if (message.sender === "me") {
            return (
              <div key={message.id} className="flex justify-end">
                <div className="text-right">
                  <div className="rounded-lg rounded-tr-sm bg-brand-500 px-3 py-2 text-[var(--token-white)] dark:bg-brand-500">
                    <p className="text-sm">{message.text}</p>
                  </div>
                  <p className="mt-2 text-theme-xs text-[var(--token-gray-500)] dark:text-[var(--token-gray-400)]">
                    {message.timestamp}
                  </p>
                </div>
              </div>
            );
          }

          return (
            <div key={message.id} className="flex items-start gap-4">
              <div className="h-10 w-10 overflow-hidden rounded-full">
                <Image
                  src={contact.avatar}
                  alt={`${contact.name} profile`}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <div>
                {message.image && (
                  <div className="mb-2 w-full max-w-[270px] overflow-hidden rounded-lg">
                    <Image
                      src={message.image}
                      alt="chat attachment"
                      width={270}
                      height={150}
                      className="w-full object-cover"
                    />
                  </div>
                )}
                {message.text && (
                  <div className="rounded-lg rounded-tl-sm bg-[var(--token-gray-100)] px-3 py-2 text-[var(--token-gray-800)] dark:bg-[var(--token-white-5)] dark:text-[var(--token-white-90)]">
                    <p className="text-sm">{message.text}</p>
                  </div>
                )}
                <p className="mt-2 text-theme-xs text-[var(--token-gray-500)] dark:text-[var(--token-gray-400)]">
                  {message.timestamp}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="sticky bottom-0 border-t border-[var(--token-gray-200)] p-3 dark:border-[var(--color-border-dark-soft)]">
        <div className="flex items-center justify-between gap-3">
          <div className="relative w-full">
            <button
              type="button"
              className="absolute left-1 top-1/2 -translate-y-1/2 text-[var(--token-gray-500)] hover:text-[var(--token-gray-800)] dark:text-[var(--token-gray-400)] dark:hover:text-[var(--token-white-90)] sm:left-3"
              aria-label="Add emoji"
            >
              <EmojiIcon />
            </button>
            <label htmlFor="message-input" className="sr-only">
              Type a message
            </label>
            <input
              id="message-input"
              type="text"
              placeholder="Type a message"
              value={messageInput}
              onChange={(event) => onMessageInputChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onSendMessage();
                }
              }}
              className="h-9 w-full border-none bg-transparent pl-12 pr-5 text-sm text-[var(--token-gray-800)] placeholder:text-[var(--token-gray-400)] focus:border-0 focus:outline-hidden focus:ring-0 dark:text-[var(--token-white-90)]"
            />
          </div>

          <div className="flex items-center">
            <button
              type="button"
              className="mr-2 text-[var(--token-gray-500)] hover:text-[var(--token-gray-800)] dark:text-[var(--token-gray-400)] dark:hover:text-[var(--token-white-90)]"
              aria-label="Attach file"
            >
              <AttachmentIcon />
            </button>
            <button
              type="button"
              className="text-[var(--token-gray-500)] hover:text-[var(--token-gray-800)] dark:text-[var(--token-gray-400)] dark:hover:text-[var(--token-white-90)]"
              aria-label="Voice message"
            >
              <MicrophoneIcon />
            </button>
            <button
              type="button"
              onClick={onSendMessage}
              className="ml-3 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-[var(--token-white)] hover:bg-brand-600 xl:ml-5"
              aria-label="Send message"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HamburgerIcon() {
  return (
    <svg
      className="fill-current"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.25 6C3.25 5.58579 3.58579 5.25 4 5.25H20C20.4142 5.25 20.75 5.58579 20.75 6C20.75 6.41421 20.4142 6.75 20 6.75H4C3.58579 6.75 3.25 6.41421 3.25 6ZM3.25 18C3.25 17.5858 3.58579 17.25 4 17.25H20C20.4142 17.25 20.75 17.5858 20.75 18C20.75 18.4142 20.4142 18.75 20 18.75H4C3.58579 18.75 3.25 18.4142 3.25 18ZM4 11.25C3.58579 11.25 3.25 11.5858 3.25 12C3.25 12.4142 3.58579 12.75 4 12.75H20C20.4142 12.75 20.75 12.4142 20.75 12C20.75 11.5858 20.4142 11.25 20 11.25H4Z"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      className="stroke-current"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M5.54488 11.7254L8.80112 10.056C8.94007 9.98476 9.071 9.89524 9.16639 9.77162C9.57731 9.23912 9.66722 8.51628 9.38366 7.89244L7.76239 4.32564C7.23243 3.15974 5.7011 2.88206 4.79552 3.78764L3.72733 4.85577C3.36125 5.22182 3.18191 5.73847 3.27376 6.24794C3.9012 9.72846 5.56003 13.0595 8.25026 15.7497C10.9405 18.44 14.2716 20.0988 17.7521 20.7262C18.2615 20.8181 18.7782 20.6388 19.1442 20.2727L20.2124 19.2045C21.118 18.2989 20.8403 16.7676 19.6744 16.2377L16.1076 14.6164C15.4838 14.3328 14.7609 14.4227 14.2284 14.8336C14.1048 14.929 14.0153 15.06 13.944 15.1989L12.2747 18.4552"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg
      className="fill-current"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.25 5.25C3.00736 5.25 2 6.25736 2 7.5V16.5C2 17.7426 3.00736 18.75 4.25 18.75H15.25C16.4926 18.75 17.5 17.7426 17.5 16.5V15.3957L20.1118 16.9465C20.9451 17.4412 22 16.8407 22 15.8716V8.12838C22 7.15933 20.9451 6.55882 20.1118 7.05356L17.5 8.60433V7.5C17.5 6.25736 16.4926 5.25 15.25 5.25H4.25ZM17.5 10.3488V13.6512L20.5 15.4325V8.56756L17.5 10.3488ZM3.5 7.5C3.5 7.08579 3.83579 6.75 4.25 6.75H15.25C15.6642 6.75 16 7.08579 16 7.5V16.5C16 16.9142 15.6642 17.25 15.25 17.25H4.25C3.83579 17.25 3.5 16.9142 3.5 16.5V7.5Z"
      />
    </svg>
  );
}

function EmojiIcon() {
  return (
    <svg
      className="fill-current"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM3.5 12C3.5 7.30558 7.30558 3.5 12 3.5C16.6944 3.5 20.5 7.30558 20.5 12C20.5 16.6944 16.6944 20.5 12 20.5C7.30558 20.5 3.5 16.6944 3.5 12ZM10.0001 9.23256C10.0001 8.5422 9.44042 7.98256 8.75007 7.98256C8.05971 7.98256 7.50007 8.5422 7.50007 9.23256V9.23266C7.50007 9.92301 8.05971 10.4827 8.75007 10.4827C9.44042 10.4827 10.0001 9.92301 10.0001 9.23266V9.23256ZM15.2499 7.98256C15.9403 7.98256 16.4999 8.5422 16.4999 9.23256V9.23266C16.4999 9.92301 15.9403 10.4827 15.2499 10.4827C14.5596 10.4827 13.9999 9.92301 13.9999 9.23266V9.23256C13.9999 8.5422 14.5596 7.98256 15.2499 7.98256ZM9.23014 13.7116C8.97215 13.3876 8.5003 13.334 8.17625 13.592C7.8522 13.85 7.79865 14.3219 8.05665 14.6459C8.97846 15.8037 10.4026 16.5481 12 16.5481C13.5975 16.5481 15.0216 15.8037 15.9434 14.6459C16.2014 14.3219 16.1479 13.85 15.8238 13.592C15.4998 13.334 15.0279 13.3876 14.7699 13.7116C14.1205 14.5274 13.1213 15.0481 12 15.0481C10.8788 15.0481 9.87961 14.5274 9.23014 13.7116Z"
      />
    </svg>
  );
}

function AttachmentIcon() {
  return (
    <svg
      className="fill-current"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.9522 14.4422C12.9522 14.452 12.9524 14.4618 12.9527 14.4714V16.1442C12.9527 16.6699 12.5265 17.0961 12.0008 17.0961C11.475 17.0961 11.0488 16.6699 11.0488 16.1442V6.15388C11.0488 5.73966 10.7131 5.40388 10.2988 5.40388C9.88463 5.40388 9.54885 5.73966 9.54885 6.15388V16.1442C9.54885 17.4984 10.6466 18.5961 12.0008 18.5961C13.355 18.5961 14.4527 17.4983 14.4527 16.1442V6.15388C14.4527 6.14308 14.4525 6.13235 14.452 6.12166C14.4347 3.84237 12.5817 2 10.2983 2C8.00416 2 6.14441 3.85976 6.14441 6.15388V14.4422C6.14441 14.4492 6.1445 14.4561 6.14469 14.463V16.1442C6.14469 19.3783 8.76643 22 12.0005 22C15.2346 22 17.8563 19.3783 17.8563 16.1442V9.55775C17.8563 9.14354 17.5205 8.80775 17.1063 8.80775C16.6921 8.80775 16.3563 9.14354 16.3563 9.55775V16.1442C16.3563 18.5498 14.4062 20.5 12.0005 20.5C9.59485 20.5 7.64469 18.5498 7.64469 16.1442V9.55775C7.64469 9.55083 7.6446 9.54393 7.64441 9.53706V6.15388C7.64441 4.68818 8.83259 3.5 10.2983 3.5C11.764 3.5 12.9522 4.68818 12.9522 6.15388V14.4422Z"
      />
    </svg>
  );
}

function MicrophoneIcon() {
  return (
    <svg
      className="stroke-current"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="7"
        y="2.75"
        width="10"
        height="12.5"
        rx="5"
        strokeWidth="1.5"
      />
      <path
        d="M20 10.25C20 14.6683 16.4183 18.25 12 18.25C7.58172 18.25 4 14.6683 4 10.25"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M10 21.25H14"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 18.25L12 21.25"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 7.5L12 10.5"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 8.25L14.5 9.75"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 8.25L9.5 9.75"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.98481 2.44399C3.11333 1.57147 1.15325 3.46979 1.96543 5.36824L3.82086 9.70527C3.90146 9.89367 3.90146 10.1069 3.82086 10.2953L1.96543 14.6323C1.15326 16.5307 3.11332 18.4291 4.98481 17.5565L16.8184 12.0395C18.5508 11.2319 18.5508 8.76865 16.8184 7.961L4.98481 2.44399ZM3.34453 4.77824C3.0738 4.14543 3.72716 3.51266 4.35099 3.80349L16.1846 9.32051C16.762 9.58973 16.762 10.4108 16.1846 10.68L4.35098 16.197C3.72716 16.4879 3.0738 15.8551 3.34453 15.2223L5.19996 10.8853C5.21944 10.8397 5.23735 10.7937 5.2537 10.7473H9.11784C9.53206 10.7473 9.86784 10.4115 9.86784 9.99726C9.86784 9.58304 9.53206 9.24726 9.11784 9.24726H5.25157C5.2358 9.20287 5.2186 9.15885 5.19996 9.11528L3.34453 4.77824Z"
        fill="white"
      />
    </svg>
  );
}
