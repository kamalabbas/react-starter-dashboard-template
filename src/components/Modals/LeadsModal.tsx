import Label from "../form/Label";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import { Lead } from "../../interface/leads";
import dateFormatter from "../../services/dateFormatter";

interface Props {
  closeModal: () => void;
  isOpen: boolean;
  lead: Lead | null;
}

export default function LeadsModal({ closeModal, isOpen, lead }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
      <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {dateFormatter(lead?.created_at)}
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            {lead?.id}
          </p>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            {lead?.IP}
          </p>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            {lead?.URL}
          </p>
        </div>
        <div className="flex flex-col">
          <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
            <div>
              {lead
                ? Object.keys(JSON.parse(lead?.body)).map((key: string) => {
                    return (
                      <>
                        <Label key={key}>{key}</Label>
                        <p className="mb-6 text-lg text-gray-500 dark:text-gray-400 lg:mb-7">
                          {JSON.parse(lead?.body)[key]}
                        </p>
                      </>
                    );
                  })
                : null}
            </div>
          </div>
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button size="sm" variant="outline" onClick={closeModal}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
