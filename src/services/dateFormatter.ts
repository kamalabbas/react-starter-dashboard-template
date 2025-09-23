const dateFormat = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hour12: true,
});

const dateFormatter = (date: string | undefined) => {
  if (date == undefined) {
    return;
  }
  return dateFormat.format(new Date(date));
};

export default dateFormatter;
